export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-r from-green-600 to-green-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">About Spring Montessori School</h1>
          <p className="text-xl text-green-100 max-w-3xl">A legacy of excellence in education, nurturing young minds for a brighter future.</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Our Mission</h2>
            <p className="text-gray-600">To provide a holistic, child-centered education that develops the intellectual, social, emotional, and physical potential of every child. We are committed to creating a safe, stimulating, and caring learning environment where students can thrive academically and grow as responsible individuals.</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Our Vision</h2>
            <p className="text-gray-600">To be a leading educational institution in Nigeria that produces well-rounded, confident, and innovative young people who are prepared to become future leaders and contribute positively to society. We envision a school where every child discovers their unique potential.</p>
          </div>
        </div>

        {/* Core Values */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Our Core Values</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { title: 'Excellence', desc: 'Striving for the highest standards in all we do' },
              { title: 'Integrity', desc: 'Building character through honesty and respect' },
              { title: 'Innovation', desc: 'Embracing creative and modern teaching methods' },
              { title: 'Community', desc: 'Fostering a supportive and inclusive school family' },
            ].map(v => (
              <div key={v.title} className="bg-green-50 rounded-lg p-5 text-center">
                <h3 className="font-semibold text-green-800 mb-2">{v.title}</h3>
                <p className="text-sm text-gray-600">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Why Choose Spring Montessori?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Experienced Teachers', desc: 'Our dedicated educators are trained in modern pedagogical methods and are passionate about helping every child succeed.' },
              { title: 'Modern Facilities', desc: 'Well-equipped classrooms, science laboratories, computer labs, library, and recreational facilities provide an optimal learning environment.' },
              { title: 'Holistic Education', desc: 'We combine strong academics with extracurricular activities including sports, music, arts, and leadership programs.' },
              { title: 'Small Class Sizes', desc: 'Our manageable class sizes ensure personalized attention for every student, allowing teachers to address individual learning needs.' },
              { title: 'Safe Environment', desc: 'A secure, child-friendly campus with strict safety protocols ensures your child learns in a protected and nurturing space.' },
              { title: 'Technology Integration', desc: 'Students benefit from computer-based learning, our CBT examination system, and digital resources that prepare them for the modern world.' },
            ].map(item => (
              <div key={item.title} className="bg-white rounded-lg shadow p-5">
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* School Levels */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Our School Levels</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-lg p-6 text-center">
              <h3 className="text-xl font-bold text-blue-800 mb-2">Primary School</h3>
              <p className="text-lg text-blue-600 mb-3">Primary 1 - 6</p>
              <p className="text-sm text-gray-600">Building strong foundations in literacy, numeracy, and critical thinking through interactive and engaging learning experiences.</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-6 text-center">
              <h3 className="text-xl font-bold text-purple-800 mb-2">Junior Secondary</h3>
              <p className="text-lg text-purple-600 mb-3">JSS 1 - 3</p>
              <p className="text-sm text-gray-600">Broadening horizons with diverse subjects, developing analytical skills, and preparing students for the challenges of senior secondary education.</p>
            </div>
            <div className="bg-green-50 rounded-lg p-6 text-center">
              <h3 className="text-xl font-bold text-green-800 mb-2">Senior Secondary</h3>
              <p className="text-lg text-green-600 mb-3">SS 1 - 3</p>
              <p className="text-sm text-gray-600">Preparing students for WAEC, NECO, and university entrance with rigorous academics, career guidance, and leadership development.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
