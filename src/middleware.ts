import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { NextResponse } from 'next/server';

// Routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/super-admin',
];

// Route prefix to role mapping
const roleRouteMap: Record<string, string[]> = {
  '/super-admin/id-cards': ['super_admin'],
  '/super-admin/scratch-cards': ['super_admin'],
  '/super-admin/system-settings': ['super_admin'],
  '/super-admin': ['super_admin', 'school_admin'],
  '/dashboard/admin': ['super_admin', 'school_admin'],
  '/dashboard/teacher': ['teacher'],
  '/dashboard/student-parent': ['student_parent'],
};

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  // Public routes — always allow
  const publicPaths = ['/', '/login', '/forgot-password', '/reset-password', '/result',
    '/about', '/academics', '/admission', '/news', '/events', '/gallery', '/contact',
    '/auth'];
  if (publicPaths.some(p => pathname === p || pathname.startsWith(p + '/'))) {
    return supabaseResponse;
  }

  // Static files, API routes, images — skip
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|css|js)$/)
  ) {
    return supabaseResponse;
  }

  // Protected routes — require authentication
  if (protectedRoutes.some(r => pathname.startsWith(r))) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }

    // Role-based route protection
    for (const [routePrefix, allowedRoles] of Object.entries(roleRouteMap)) {
      if (pathname.startsWith(routePrefix)) {
        // Get user role from profiles
        const { data: profile } = await (await import('@/lib/supabase/server'))
          .createClient()
          .then(supabase => supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()
          );

        if (!profile || !allowedRoles.includes(profile.role)) {
          // Redirect to appropriate dashboard based on role
          const dashboardUrl = request.nextUrl.clone();
          dashboardUrl.pathname = profile ? `/dashboard` : '/login';
          return NextResponse.redirect(dashboardUrl);
        }
        break;
      }
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
