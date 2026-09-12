export default function NewsPage() {
  // Placeholder news items - will be CMS-driven from announcements table
  const news = [
    {
      title: 'New Academic Session Begins',
      date: 'September 2026',
      excerpt: 'We welcome all students back for an exciting new academic session. New programs and facilities have been added to enhance the learning experience.',
      category: 'Announcement',
    },
    {
      title: 'Inter-House Sports Competition',
      date: 'October 2026',
      excerpt: 'Our annual inter-house sports competition is coming up. Students are encouraged to register for their preferred events and begin preparations.',
      category: 'Sports',
    },
    {
      title: 'Science Fair 2026',
      date: 'November 2026',
      excerpt: 'The school will host its annual science fair showcasing student innovations and projects. Parents and guardians are invited to attend.',
      category: 'Academics',
    },
    {
      title: 'PTA Meeting Notice',
      date: 'October 2026',
      excerpt: 'The next PTA meeting has been scheduled to discuss the upcoming term plans, fee adjustments, and development projects. All parents are encouraged to attend.',
      category: 'General',
    },
  ];

  return (
    <div>
      <section className="bg-gradient-to-r from-orange-500 to-orange-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">News & Updates</h1>
          <p className="text-xl text-orange-100">Stay informed with the latest happenings at Spring Montessori School.</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {news.map((item, i) => (
            <article key={i} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded">{item.category}</span>
                  <span className="text-xs text-gray-500">{item.date}</span>
                </div>
                <h2 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h2>
                <p className="text-sm text-gray-600">{item.excerpt}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-8 text-center text-sm text-gray-500">
          More news and updates will be posted here regularly. Check back often!
        </div>
      </div>
    </div>
  );
}
