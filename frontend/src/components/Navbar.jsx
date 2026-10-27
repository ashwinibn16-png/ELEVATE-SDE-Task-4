import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Menu, 
  X, 
  Lock, 
  LayoutDashboard, 
  FileText, 
  Search, 
  Award,
  LogOut
} from 'lucide-react';
import { isAdminAuthenticated, adminLogout } from '../services/api';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const isAdmin = isAdminAuthenticated();

  const handleAdminLogout = () => {
    adminLogout();
    setIsMobileMenuOpen(false);
    navigate('/admin/login');
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-navy-800 text-white shadow-xs'
        : 'text-slate-600 hover:text-navy-900 hover:bg-slate-100'
    }`;

  const mobileNavLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-base font-medium transition-colors ${
      isActive
        ? 'bg-navy-800 text-white'
        : 'text-slate-700 hover:bg-slate-100 hover:text-navy-900'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Gov/Official Micro Banner */}
      <div className="bg-navy-950 text-slate-300 text-[11px] py-1 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
            <span>Digital Certificate Issuing & Public Verification Portal</span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-slate-400">
            <span>ELEVATE SDE Internship Prototype</span>
            <span className="text-slate-600">•</span>
            <span>Standardized Citizen Services</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link 
            to="/" 
            className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-navy-800 rounded-lg p-1"
          >
            <div className="w-10 h-10 rounded-xl bg-navy-800 text-white flex items-center justify-center shadow-md shadow-navy-900/10 group-hover:bg-navy-900 transition-colors">
              <ShieldCheck className="w-6 h-6 text-teal-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-navy-900">
                  CredVault
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
                  Gov-SaaS
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Certificate Issuing & Verification Platform
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <NavLink to="/" end className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/request" className={navLinkClass}>
              <FileText className="w-4 h-4" />
              Request Certificate
            </NavLink>
            <NavLink to="/track" className={navLinkClass}>
              <Search className="w-4 h-4" />
              Track Application
            </NavLink>
            <NavLink to="/verify" className={navLinkClass}>
              <Award className="w-4 h-4" />
              Verify Certificate
            </NavLink>
          </nav>

          {/* Right Action: Admin Access */}
          <div className="hidden md:flex items-center gap-2">
            {isAdmin ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/admin/applications"
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-navy-50 text-navy-800 hover:bg-navy-100 border border-navy-200 transition-colors"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-teal-600" />
                  Admin Portal
                </Link>
                <button
                  onClick={handleAdminLogout}
                  title="Logout Admin"
                  className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/admin/login"
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white text-navy-800 border border-slate-300 hover:bg-slate-50 hover:border-navy-400 transition-colors shadow-xs"
              >
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                Admin Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-navy-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-navy-800"
              aria-expanded={isMobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2 animate-fadeIn">
          <NavLink
            to="/"
            end
            onClick={() => setIsMobileMenuOpen(false)}
            className={mobileNavLinkClass}
          >
            Home
          </NavLink>
          <NavLink
            to="/request"
            onClick={() => setIsMobileMenuOpen(false)}
            className={mobileNavLinkClass}
          >
            <FileText className="w-5 h-5 text-teal-600" />
            Request Certificate
          </NavLink>
          <NavLink
            to="/track"
            onClick={() => setIsMobileMenuOpen(false)}
            className={mobileNavLinkClass}
          >
            <Search className="w-5 h-5 text-teal-600" />
            Track Application
          </NavLink>
          <NavLink
            to="/verify"
            onClick={() => setIsMobileMenuOpen(false)}
            className={mobileNavLinkClass}
          >
            <Award className="w-5 h-5 text-teal-600" />
            Verify Certificate
          </NavLink>

          <div className="pt-3 border-t border-slate-100">
            {isAdmin ? (
              <div className="space-y-2">
                <Link
                  to="/admin/applications"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-semibold bg-navy-50 text-navy-800 border border-navy-200"
                >
                  <span className="flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4 text-teal-600" />
                    Admin Portal (Applications)
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-teal-100 text-teal-800 rounded">
                    Active
                  </span>
                </Link>
                <button
                  onClick={handleAdminLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50"
                >
                  <LogOut className="w-4 h-4" />
                  Logout Admin Session
                </button>
              </div>
            ) : (
              <Link
                to="/admin/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-navy-800 text-white hover:bg-navy-900"
              >
                <Lock className="w-4 h-4" />
                Admin Login
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
