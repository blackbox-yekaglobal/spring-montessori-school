export default function DashboardNotFound() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl font-bold text-gray-300 mb-4">404</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Page Not Found</h2>
        <p className="text-gray-600 mb-4">The page you are looking for does not exist.</p>
        <a
          href="/dashboard"
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 inline-block"
        >
          Back to Dashboard
        </a>
      </div>
    </div>
  );
}
