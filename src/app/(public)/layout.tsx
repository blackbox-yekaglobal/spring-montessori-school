import Link from 'next/link';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-10 w-10 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">S</div>
              <div>
                <div className="text-lg font-bold text-gray-900">Spring Montessori</div>
                <div className="text-xs text-gray-500 -mt-1">School</div>
              </div>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">Home</Link>
              <Link href="/about" className="text-sm text-gray-600 hover:text-gray-900">About</Link>
              <Link href="/academics" className="text-sm text-gray-600 hover:text-gray-900">Academics</Link>
              <Link href="/news" className="text-sm text-gray-600 hover:text-gray-900">News</Link>
              <Link href="/events" className="text-sm text-gray-600 hover:text-gray-900">Events</Link>
              <Link href="/gallery" className="text-sm text-gray-600 hover:text-gray-900">Gallery</Link>
              <Link href="/contact" className="text-sm text-gray-600 hover:text-gray-900">Contact</Link>
              <Link href="/login" className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700">
                Portal Login
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-bold text-lg mb-3">Spring Montessori School</h3>
              <p className="text-sm text-gray-400">Nurturing excellence from primary through secondary education. Building tomorrow&apos;s leaders today.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white">About Us</Link></li>
                <li><Link href="/academics" className="hover:text-white">Academics</Link></li>
                <li><Link href="/news" className="hover:text-white">News & Updates</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Academics</h4>
              <ul className="space-y-2 text-sm">
                <li><span className="text-gray-400">Primary 1-6</span></li>
                <li><span className="text-gray-400">JSS 1-3</span></li>
                <li><span className="text-gray-400">SS 1-3</span></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Spring Montessori School</li>
                <li>Lagos, Nigeria</li>
                <li>info@springmontessori.edu.ng</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Spring Montessori School. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
