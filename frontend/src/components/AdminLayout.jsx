import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Award, 
  Home, 
  LogOut, 
  ShieldCheck, 
  UserCheck 
} from 'lucide-react';
import { adminLogout, getAdminUser } from '../services/api';

export default function AdminLayout({ children, activeTab = 'applications' }) {
  const navigate = useNavigate();
  const adminUser = getAdminUser();

  const handleLogout = () => {
    adminLogout();
    navigate('/admin/login');
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
      isActive
        ? 'bg-navy-800 text-white shadow-sm'
        : 'text-slate-600 hover:text-navy-900 hover:bg-slate-100'
    }`;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Admin Bar */}
      <header className="bg-navy-900 text-white border-b border-navy-950 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-teal-500 text-navy-950 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-lg text-white tracking-tight">
                  CredVault
                </span>
                <span className="ml-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-navy-800 text-teal-300 border border-navy-700">
                  Admin Portal
                </span>
              </div>
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-300 bg-navy-950/60 px-3 py-1.5 rounded-lg border border-navy-800">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>Admin: <strong>{adminUser?.username || 'admin'}</strong></span>
            </div>

            <Link
              to="/"
              className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-navy-800 hover:bg-navy-700 px-3 py-1.5 rounded-lg border border-navy-700 transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Public Homepage</span>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-semibold text-rose-300 hover:text-white bg-rose-950/50 hover:bg-rose-900/80 px-3 py-1.5 rounded-lg border border-rose-900/50 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Admin Subnav / Tabs Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
          <nav className="flex items-center gap-2" aria-label="Admin Navigation Tabs">
            <NavLink to="/admin/applications" className={linkClass}>
              <FileText className="w-4 h-4 text-teal-600" />
              <span>Applications</span>
            </NavLink>
            <NavLink to="/admin/certificates" className={linkClass}>
              <Award className="w-4 h-4 text-teal-600" />
              <span>Certificates Registry</span>
            </NavLink>
          </nav>
        </div>
      </div>

      {/* Main Admin Page Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
