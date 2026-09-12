export default function AcademicsPage() {
  return (
    <div>
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Academics</h1>
          <p className="text-xl text-blue-100 max-w-3xl">A comprehensive curriculum designed to bring out the best in every student.</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Curriculum Overview */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">Our Curriculum</h2>
          <p className="text-gray-600 text-center max-w-3xl mx-auto mb-8">
            Spring Montessori School follows the Nigerian National Curriculum, enhanced with modern teaching methodologies
            and supplementary international resources to provide a world-class education.
          </p>
        </div>

        {/* Subject Areas */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Subject Areas</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              'Mathematics', 'English Language', 'Basic Science', 'Basic Technology',
              'Social Studies', 'Civic Education', 'Agricultural Science', 'Business Studies',
              'Computer Studies', 'French Language', 'Creative Arts', 'Music',
              'Physical & Health Education', 'Christian Religious Studies', 'Islamic Studies', 'Yoruba / Igbo / Hausa',
              'Biology', 'Chemistry', 'Physics', 'Economics',
              'Government', 'Literature in English', 'Geography', 'Further Mathematics',
            ].map(subject => (
              <div key={subject} className="bg-white rounded-lg shadow-sm p-3 text-center border">
                <span className="text-sm font-medium text-gray-700">{subject}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Academic Calendar */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Academic Structure</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-3">School Sessions</h3>
              <p className="text-sm text-gray-600 mb-2">The academic year runs from September to July, divided into three terms:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>First Term: September - December</li>
                <li>Second Term: January - April</li>
                <li>Third Term: May - July</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-3">School Hours</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>Assembly: 7:45 AM</li>
                <li>Lessons: 8:00 AM - 2:30 PM</li>
                <li>Break: 10:00 AM - 10:30 AM</li>
                <li>Lunch: 12:30 PM - 1:00 PM</li>
                <li>Dismissing: 2:30 PM</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Assessment</h3>
              <p className="text-sm text-gray-600 mb-2">Student performance is evaluated through:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>Continuous Assessment (CA)</li>
                <li>Mid-Term Examinations</li>
                <li>End-of-Term Examinations</li>
                <li>Computer-Based Testing (CBT)</li>
                <li>Projects & Assignments</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Admission Info */}
        <div className="bg-green-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-green-800 mb-3">Admission Information</h2>
          <p className="text-gray-600 mb-4">We accept applications throughout the year. Prospective students are welcome for assessment and enrollment.</p>
          <p className="text-sm text-gray-500">For admission inquiries, please contact the school administration office or visit us in person.</p>
        </div>
      </div>
    </div>
  );
}
