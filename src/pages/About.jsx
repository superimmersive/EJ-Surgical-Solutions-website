import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, Truck, Shield, Heart } from 'lucide-react';
import { company, companyValues } from '../data/company';

export default function About() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-3xl">
        <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">About {company.name}</h1>
        <p className="mt-2 text-lg text-brand-600">{company.tagline}</p>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-8">
            <h2 className="text-xl font-bold text-slate-900">Who We Are</h2>
            <div className="mt-4 space-y-4 text-slate-600 leading-relaxed">
              {companyValues.split('\n\n').map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </div>

          <div className="card p-8">
            <h2 className="text-xl font-bold text-slate-900">Our Customers</h2>
            <p className="mt-4 text-slate-600 leading-relaxed">
              We serve a diverse range of clients across South Africa, including:
            </p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {[
                'Medical institutions',
                'General practitioners',
                'Research institutions',
                'Pharmacies',
                'Veterinarians',
                'Old age homes & care facilities',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-slate-600">
                  <Heart className="h-4 w-4 text-brand-600" /> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="font-bold text-slate-900">{company.founder.name}</h3>
            <p className="text-sm text-brand-600">{company.founder.title}</p>
          </div>

          <div className="card p-6 space-y-4">
            <h3 className="font-bold text-slate-900">Quick Facts</h3>
            <div className="flex items-start gap-3 text-sm text-slate-600">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
              <div>
                <p className="font-medium text-slate-900">Head Office</p>
                <p>{company.address}</p>
                <p className="text-slate-500">Garden Route, {company.province}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-sm text-slate-600">
              <Truck className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
              <div>
                <p className="font-medium text-slate-900">Delivery</p>
                <p>{company.deliveryNote}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-sm text-slate-600">
              <Shield className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
              <div>
                <p className="font-medium text-slate-900">Certification</p>
                <p>Products supplied with certification confirming industry standards</p>
              </div>
            </div>
          </div>

          <Link to="/shop" className="btn-primary w-full">
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
}
