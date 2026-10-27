import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';
import Button from '../components/Button';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="text-center space-y-6 max-w-md">
        <div className="w-16 h-16 bg-navy-50 text-navy-800 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
          <ShieldAlert className="w-10 h-10 text-teal-600" />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-1 rounded">
            Error 404
          </span>
          <h1 className="text-3xl font-extrabold text-navy-900 tracking-tight">
            Page Not Found
          </h1>
          <p className="text-sm text-slate-600">
            The page or resource you requested does not exist on CredVault. Please check the URL or return to the main citizen portal.
          </p>
        </div>
        <div className="pt-2 flex justify-center gap-3">
          <Link to="/">
            <Button variant="primary" leftIcon={Home}>
              Return to Homepage
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
