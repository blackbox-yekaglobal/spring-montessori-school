import { createContactEmail } from '@/lib/actions/email';

export default async function ContactPage() {
  return (
    <div>
      <section className="bg-gradient-to-r from-teal-600 to-teal-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl text-teal-100">We&apos;d love to hear from you. Get in touch with us.</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Get in Touch</h2>
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Address</div>
                  <div className="text-sm text-gray-600">Spring Montessori School, Lagos, Nigeria</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Email</div>
                  <div className="text-sm text-gray-600">info@springmontessori.edu.ng</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Phone</div>
                  <div className="text-sm text-gray-600">+234 (0) 800 000 0000</div>
                </div>
              </div>
            </div>

            <h3 className="font-semibold text-gray-900 mb-2">School Hours</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Monday - Friday: 7:45 AM - 2:30 PM</p>
              <p>Office Hours: 7:30 AM - 3:00 PM</p>
              <p>Saturday & Sunday: Closed</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Send us a Message</h2>
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}

async function ContactForm() {
  return (
    <form className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
        <input type="text" name="name" required className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="Your full name" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input type="email" name="email" required className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="your@email.com" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
        <select name="subject" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
          <option value="">Select a subject</option>
          <option value="admission">Admission Inquiry</option>
          <option value="general">General Inquiry</option>
          <option value="feedback">Feedback</option>
          <option value="complaint">Complaint</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
        <textarea name="message" rows={4} required className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="Your message..." />
      </div>
      <button type="submit" formAction={submitContact} className="w-full py-2 bg-teal-600 text-white font-medium rounded-md hover:bg-teal-700 text-sm">
        Send Message
      </button>
    </form>
  );
}

async function submitContact(formData: FormData) {
  'use server';
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const subject = formData.get('subject') as string;
  const message = formData.get('message') as string;

  await createContactEmail({ name, email, subject, message });
}
