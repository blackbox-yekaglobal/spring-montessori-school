export default function EventsPage() {
  const events = [
    { title: 'First Term Resumption', date: 'September 8, 2026', time: '7:45 AM', type: 'Academic' },
    { title: 'Inter-House Sports Competition', date: 'October 15, 2026', time: '9:00 AM', type: 'Sports' },
    { title: 'PTA General Meeting', date: 'October 22, 2026', time: '10:00 AM', type: 'Meeting' },
    { title: 'First Term Mid-Term Break', date: 'October 27-31, 2026', time: 'All Day', type: 'Holiday' },
    { title: 'Science Fair & Exhibition', date: 'November 14, 2026', time: '10:00 AM', type: 'Academic' },
    { title: 'First Term End', date: 'December 18, 2026', time: '12:00 PM', type: 'Academic' },
    { title: 'Second Term Resumption', date: 'January 7, 2026', time: '7:45 AM', type: 'Academic' },
    { title: 'Cultural Day Celebration', date: 'February 20, 2027', time: '9:00 AM', type: 'Cultural' },
  ];

  const typeColors: Record<string, string> = {
    Academic: 'bg-blue-100 text-blue-700',
    Sports: 'bg-green-100 text-green-700',
    Meeting: 'bg-purple-100 text-purple-700',
    Holiday: 'bg-red-100 text-red-700',
    Cultural: 'bg-yellow-100 text-yellow-700',
  };

  return (
    <div>
      <section className="bg-gradient-to-r from-purple-600 to-purple-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">School Events</h1>
          <p className="text-xl text-purple-100">Important dates and upcoming events at Spring Montessori School.</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-4">
          {events.map((event, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-center min-w-[60px]">
                  <div className="text-xs text-gray-500 uppercase">{event.date.split(' ')[0]}</div>
                  <div className="text-lg font-bold text-gray-900">{event.date.split(' ')[1]?.replace(',', '')}</div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{event.title}</h3>
                  <p className="text-sm text-gray-500">{event.time}</p>
                </div>
              </div>
              <span className={`px-3 py-1 text-xs font-medium rounded-full ${typeColors[event.type] || 'bg-gray-100 text-gray-700'}`}>
                {event.type}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center text-sm text-gray-500">
          This calendar is updated regularly. Please check back for any changes or additions.
        </div>
      </div>
    </div>
  );
}
