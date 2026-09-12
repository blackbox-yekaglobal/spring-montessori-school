import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Spring Montessori School</h1>
            <p className="text-blue-200 text-sm">Nurturing Excellence in Education</p>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/about" className="text-sm hover:text-blue-200">About</Link>
            <Link href="/academics" className="text-sm hover:text-blue-200">Academics</Link>
            <Link href="/admission" className="text-sm hover:text-blue-200">Admission</Link>
            <Link href="/news" className="text-sm hover:text-blue-200">News</Link>
            <Link href="/events" className="text-sm hover:text-blue-200">Events</Link>
            <Link href="/gallery" className="text-sm hover:text-blue-200">Gallery</Link>
            <Link href="/contact" className="text-sm hover:text-blue-200">Contact</Link>
            <Link href="/result" className="text-sm bg-white text-blue-700 px-4 py-2 rounded-md font-medium hover:bg-blue-50">E-Result</Link>
            <Link href="/login" className="text-sm bg-blue-600 px-4 py-2 rounded-md font-medium hover:bg-blue-500 border border-blue-500">Login</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-700 to-blue-900 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Welcome to Spring Montessori School</h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
            Providing quality education for Primary and Secondary students.
            Building tomorrow&apos;s leaders through excellence and innovation.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/admission" className="bg-white text-blue-700 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
              Apply for Admission
            </Link>
            <Link href="/about" className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">Why Choose Spring Montessori?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-sm text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 text-xl">A</span>
              </div>
              <h4 className="text-lg font-semibold mb-2">Academic Excellence</h4>
              <p className="text-gray-600 text-sm">Rigorous curriculum designed to bring out the best in every student.</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 text-xl">T</span>
              </div>
              <h4 className="text-lg font-semibold mb-2">Qualified Teachers</h4>
              <p className="text-gray-600 text-sm">Dedicated and experienced educators committed to student success.</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600 text-xl">D</span>
              </div>
              <h4 className="text-lg font-semibold mb-2">Digital Learning</h4>
              <p className="text-gray-600 text-sm">Modern CBT system, online resources, and digital management platform.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/result" className="p-6 bg-blue-50 rounded-lg text-center hover:bg-blue-100 transition-colors">
              <p className="font-semibold text-blue-700">Check Results</p>
              <p className="text-sm text-blue-500 mt-1">E-Result Portal</p>
            </Link>
            <Link href="/admission" className="p-6 bg-green-50 rounded-lg text-center hover:bg-green-100 transition-colors">
              <p className="font-semibold text-green-700">Admission</p>
              <p className="text-sm text-green-500 mt-1">Apply Online</p>
            </Link>
            <Link href="/news" className="p-6 bg-orange-50 rounded-lg text-center hover:bg-orange-100 transition-colors">
              <p className="font-semibold text-orange-700">News</p>
              <p className="text-sm text-orange-500 mt-1">Latest Updates</p>
            </Link>
            <Link href="/contact" className="p-6 bg-purple-50 rounded-lg text-center hover:bg-purple-100 transition-colors">
              <p className="font-semibold text-purple-700">Contact</p>
              <p className="text-sm text-purple-500 mt-1">Get in Touch</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-lg font-bold mb-4">Spring Montessori School</h4>
              <p className="text-gray-400 text-sm">Nurturing excellence in education for Primary and Secondary students.</p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Quick Links</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/about" className="hover:text-white">About Us</Link></li>
                <li><Link href="/academics" className="hover:text-white">Academics</Link></li>
                <li><Link href="/admission" className="hover:text-white">Admission</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Portal Access</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/login" className="hover:text-white">Staff Login</Link></li>
                <li><Link href="/login" className="hover:text-white">Student/Parent Login</Link></li>
                <li><Link href="/result" className="hover:text-white">E-Result Checker</Link></li>
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
