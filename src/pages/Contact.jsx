import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import { company } from '../data/company';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });

  const updateField = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-3xl">
        <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">Contact Us</h1>
        <p className="mt-2 text-slate-500">
          Have a question or need to place an order? Get in touch — we'd love to hear from you.
        </p>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="font-bold text-slate-900">Contact Info</h2>
            <p className="mt-1 text-sm text-slate-500">Contact us today!</p>

            <ul className="mt-6 space-y-5">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Address</p>
                  <p className="text-sm text-slate-600">{company.address}</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Phone</p>
                  <a href={`tel:${company.phone.replace(/\s/g, '')}`} className="text-sm text-brand-600 hover:underline">
                    {company.phone}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Email</p>
                  <a href={`mailto:${company.email}`} className="text-sm text-brand-600 hover:underline">
                    {company.email}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Work Hours</p>
                  <p className="text-sm text-slate-600">{company.hours.weekday}</p>
                  <p className="text-sm text-slate-600">{company.hours.weekend}</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="card overflow-hidden">
            <iframe
              title="EJ Surgical Solutions location"
              src="https://maps.google.com/maps?q=102+Meade+Gardens,+George,+6530,+South+Africa&output=embed"
              className="h-48 w-full border-0 sm:h-56"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="card p-8">
            {submitted ? (
              <div className="py-8 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                  <Send className="h-8 w-8 text-emerald-600" />
                </div>
                <h2 className="mt-4 text-xl font-bold text-slate-900">Message Sent!</h2>
                <p className="mt-2 text-slate-500">
                  Thank you for contacting us. Our team will respond shortly. You can also email us directly at{' '}
                  <a href={`mailto:${company.email}`} className="text-brand-600 hover:underline">
                    {company.email}
                  </a>
                </p>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold text-slate-900">Send Us a Message</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Or email your order directly to{' '}
                  <a href={`mailto:${company.email}`} className="text-brand-600 hover:underline">
                    {company.email}
                  </a>
                </p>
                <form onSubmit={handleSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Name</label>
                    <input required className="input-field" value={form.name} onChange={updateField('name')} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Phone</label>
                    <input required type="tel" className="input-field" value={form.phone} onChange={updateField('phone')} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
                    <input required type="email" className="input-field" value={form.email} onChange={updateField('email')} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Message / Order Details</label>
                    <textarea
                      required
                      rows={5}
                      className="input-field resize-none"
                      placeholder="Tell us what you need or describe your order..."
                      value={form.message}
                      onChange={updateField('message')}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <button type="submit" className="btn-primary w-full sm:w-auto">
                      <Send className="h-4 w-4" /> Send Message
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
