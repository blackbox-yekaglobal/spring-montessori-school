export default function GalleryPage() {
  const categories = ['All', 'Campus', 'Classrooms', 'Sports', 'Events', 'Laboratories'];

  return (
    <div>
      <section className="bg-gradient-to-r from-pink-600 to-pink-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Photo Gallery</h1>
          <p className="text-xl text-pink-100">Explore life at Spring Montessori School through our photo gallery.</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map(cat => (
            <button
              key={cat}
              className={`px-4 py-2 rounded-full text-sm font-medium ${cat === 'All' ? 'bg-pink-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Grid - Placeholder */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[
            { title: 'School Building', category: 'Campus' },
            { title: 'Classroom Session', category: 'Classrooms' },
            { title: 'Sports Day', category: 'Sports' },
            { title: 'Science Lab', category: 'Laboratories' },
            { title: 'Assembly Ground', category: 'Campus' },
            { title: 'Library', category: 'Classrooms' },
            { title: 'Cultural Day', category: 'Events' },
            { title: 'Computer Lab', category: 'Laboratories' },
            { title: 'Playground', category: 'Campus' },
            { title: 'Graduation Ceremony', category: 'Events' },
            { title: 'Art Exhibition', category: 'Events' },
            { title: 'Staff Room', category: 'Campus' },
          ].map((item, i) => (
            <div key={i} className="bg-gray-100 rounded-lg aspect-square flex flex-col items-center justify-center text-gray-400">
              <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-xs font-medium">{item.title}</span>
              <span className="text-xs text-gray-300">{item.category}</span>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          Photos will be uploaded by the school administration. Check back soon for updates!
        </div>
      </div>
    </div>
  );
}
