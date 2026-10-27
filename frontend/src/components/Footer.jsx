import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, ExternalLink, RefreshCw } from 'lucide-react';
import { resetToDemoData } from '../services/storageService';

export default function Footer() {
  const handleResetData = () => {
    if (window.confirm('Reset sample records back to initial state? Any custom demo records will be restored to defaults.')) {
      resetToDemoData();
      window.location.reload();
    }
  };

  return (
    <footer className="bg-navy-950 text-slate-300 border-t border-navy-900 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-teal-600 text-white flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-white">
                  CredVault
                </span>
                <p className="text-xs text-teal-400 font-medium">
                  Certificate Issuing & Verification Platform
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              A modern digital citizen service platform built for secure application filing, 
              lifecycle tracking, tamper-evident digital certificate issuance, and instant public authenticity verification.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs bg-navy-900 text-slate-300 border border-navy-800">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                Local Simulation Ready
              </span>
              <button
                onClick={handleResetData}
                type="button"
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-teal-300 transition-colors"
                title="Reset localStorage demo data to fresh seed state"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset Demo Data
              </button>
            </div>
          </div>

          {/* Citizen Services */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-teal-400 mb-3">
              Citizen Services
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/request" className="hover:text-white transition-colors">
                  Request New Certificate
                </Link>
              </li>
              <li>
                <Link to="/track" className="hover:text-white transition-colors">
                  Track Application Status
                </Link>
              </li>
              <li>
                <Link to="/verify" className="hover:text-white transition-colors">
                  Verify Digital Certificate
                </Link>
              </li>
            </ul>
          </div>

          {/* Admin & Prototype Info */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-teal-400 mb-3">
              Administrative & Tech
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/admin/login" className="flex items-center gap-1.5 hover:text-white transition-colors">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  Admin Login
                </Link>
              </li>
              <li>
                <Link to="/admin/applications" className="hover:text-white transition-colors">
                  Applications Dashboard
                </Link>
              </li>
              <li>
                <Link to="/admin/certificates" className="hover:text-white transition-colors">
                  Certificates Registry
                </Link>
              </li>
              <li className="pt-2 text-xs text-slate-400">
                <span className="text-slate-300 font-medium">Demo Auth:</span> admin / admin
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="border-t border-navy-900 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>
            © {new Date().getFullYear()} CredVault. ELEVATE SDE Internship Task 2 Prototype.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-slate-400">
              Frontend-only prototype using browser localStorage.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
