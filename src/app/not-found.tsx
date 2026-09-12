export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl font-bold text-gray-300 mb-4">404</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Page Not Found</h2>
        <p className="text-gray-600 mb-6">The page you are looking for does not exist or has been moved.</p>
        <div className="flex gap-3 justify-center">
          <a
            href="/"
            className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
          >
            Go Home
          </a>
          <a
            href="/login"
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200"
          >
            Login
          </a>
        </div>
      </div>
    </div>
  );
}
