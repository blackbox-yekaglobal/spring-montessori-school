(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push(["chunks/[root-of-the-server]__15pcys3._.js",
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}),
"[externals]/node:buffer [external] (node:buffer, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}),
"[project]/src/lib/supabase/middleware.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "updateSession",
    ()=>updateSession
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/createServerClient.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$api$2f$server$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/api/server.js [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/server/web/spec-extension/response.js [middleware-edge] (ecmascript)");
;
;
async function updateSession(request) {
    let supabaseResponse = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next({
        request
    });
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["createServerClient"])(("TURBOPACK compile-time value", "https://wjqjreiuahykuxyrugou.supabase.co"), ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqcWpyZWl1YWh5a3V4eXJ1Z291Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkxNjU5MzQsImV4cCI6MjEwNDc0MTkzNH0.u4tQfXPeafJJ15XHR4zdUgSLJX5bkHPOWCPI0QeOav8"), {
        cookies: {
            getAll () {
                return request.cookies.getAll();
            },
            setAll (cookiesToSet) {
                cookiesToSet.forEach(({ name, value })=>request.cookies.set(name, value));
                supabaseResponse = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next({
                    request
                });
                cookiesToSet.forEach(({ name, value, options })=>supabaseResponse.cookies.set(name, value, options));
            }
        }
    });
    // Refreshing the auth token
    const { data: { user } } = await supabase.auth.getUser();
    return {
        supabaseResponse,
        user
    };
}
}),
"[project]/src/lib/supabase/server.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createClient",
    ()=>createClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/createServerClient.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$api$2f$headers$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/api/headers.js [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$request$2f$cookies$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/server/request/cookies.js [middleware-edge] (ecmascript)");
;
;
async function createClient() {
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$request$2f$cookies$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["cookies"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["createServerClient"])(("TURBOPACK compile-time value", "https://wjqjreiuahykuxyrugou.supabase.co"), ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqcWpyZWl1YWh5a3V4eXJ1Z291Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkxNjU5MzQsImV4cCI6MjEwNDc0MTkzNH0.u4tQfXPeafJJ15XHR4zdUgSLJX5bkHPOWCPI0QeOav8"), {
        cookies: {
            getAll () {
                return cookieStore.getAll();
            },
            setAll (cookiesToSet) {
                try {
                    cookiesToSet.forEach(({ name, value, options })=>cookieStore.set(name, value, options));
                } catch  {
                // The `setAll` method was called from a Server Component.
                // This can be ignored if you have middleware refreshing sessions.
                }
            }
        }
    });
}
}),
"[project]/src/middleware.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "config",
    ()=>config,
    "middleware",
    ()=>middleware
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$middleware$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase/middleware.ts [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$api$2f$server$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/api/server.js [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/server/web/spec-extension/response.js [middleware-edge] (ecmascript)");
;
;
// Routes that require authentication
const protectedRoutes = [
    '/dashboard',
    '/super-admin'
];
// Route prefix to role mapping
const roleRouteMap = {
    '/super-admin/id-cards': [
        'super_admin'
    ],
    '/super-admin/scratch-cards': [
        'super_admin'
    ],
    '/super-admin/system-settings': [
        'super_admin'
    ],
    '/super-admin': [
        'super_admin',
        'school_admin'
    ],
    '/dashboard/admin': [
        'super_admin',
        'school_admin'
    ],
    '/dashboard/teacher': [
        'teacher'
    ],
    '/dashboard/student-parent': [
        'student_parent'
    ]
};
async function middleware(request) {
    const { supabaseResponse, user } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$middleware$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["updateSession"])(request);
    const { pathname } = request.nextUrl;
    // Public routes — always allow
    const publicPaths = [
        '/',
        '/login',
        '/forgot-password',
        '/reset-password',
        '/result',
        '/about',
        '/academics',
        '/admission',
        '/news',
        '/events',
        '/gallery',
        '/contact',
        '/auth'
    ];
    if (publicPaths.some((p)=>pathname === p || pathname.startsWith(p + '/'))) {
        return supabaseResponse;
    }
    // Static files, API routes, images — skip
    if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|css|js)$/)) {
        return supabaseResponse;
    }
    // Protected routes — require authentication
    if (protectedRoutes.some((r)=>pathname.startsWith(r))) {
        if (!user) {
            const url = request.nextUrl.clone();
            url.pathname = '/login';
            url.searchParams.set('redirect', pathname);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(url);
        }
        // Role-based route protection
        for (const [routePrefix, allowedRoles] of Object.entries(roleRouteMap)){
            if (pathname.startsWith(routePrefix)) {
                // Get user role from profiles
                const { data: profile } = await (await Promise.resolve().then(()=>__turbopack_context__.i("[project]/src/lib/supabase/server.ts [middleware-edge] (ecmascript)"))).createClient().then((supabase)=>supabase.from('profiles').select('role').eq('id', user.id).single());
                if (!profile || !allowedRoles.includes(profile.role)) {
                    // Redirect to appropriate dashboard based on role
                    const dashboardUrl = request.nextUrl.clone();
                    dashboardUrl.pathname = profile ? `/dashboard` : '/login';
                    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(dashboardUrl);
                }
                break;
            }
        }
    }
    return supabaseResponse;
}
const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
    ]
};
}),
]);

//# sourceMappingURL=%5Broot-of-the-server%5D__15pcys3._.js.map