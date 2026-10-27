import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Search, 
  Award, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Lock, 
  Clock, 
  Database,
  QrCode,
  Users
} from 'lucide-react';
import Button from '../components/Button';

export default function Home() {
  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-navy-900 via-navy-800 to-navy-950 text-white py-16 sm:py-24">
        {/* Background decorative grid/glow */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
        <div className="absolute -top-24 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-400/20 text-teal-300 text-xs sm:text-sm font-semibold tracking-wide">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>Official Citizen Credential Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              CredVault
            </h1>

            <p className="text-xl sm:text-2xl text-teal-200 font-medium">
              Certificate Issuing & Verification Platform
            </p>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Empowering citizens with seamless digital certificate requests and real-time tracking, 
              while providing authorities with verified issuance, lifecycle audit, and instant public authenticity verification.
            </p>

            {/* Hero Quick Action Pills */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              <Link to="/request">
                <Button size="lg" variant="teal" rightIcon={ArrowRight}>
                  Request Certificate
                </Button>
              </Link>
              <Link to="/verify">
                <Button size="lg" variant="secondary" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                  Verify Certificate
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Prominent Action Cards Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 sm:-mt-14 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Request Certificate */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-md hover:shadow-xl transition-all duration-200 group flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-navy-50 text-navy-800 flex items-center justify-center group-hover:bg-navy-800 group-hover:text-white transition-colors duration-200">
                <FileText className="w-7 h-7 text-teal-600 group-hover:text-teal-300" />
              </div>
              <div>
                <span className="text-xs font-bold tracking-wider uppercase text-teal-600">
                  Step 1 • Citizen Service
                </span>
                <h3 className="text-xl font-bold text-navy-900 mt-1">
                  Request Certificate
                </h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                Submit an online application with your verified personal information, contact number, and domicile state.
              </p>
            </div>

            <div className="pt-6">
              <Link to="/request" className="block">
                <Button variant="primary" className="w-full justify-between" rightIcon={ArrowRight}>
                  Request Certificate
                </Button>
              </Link>
            </div>
          </div>

          {/* Card 2: Track Application */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-md hover:shadow-xl transition-all duration-200 group flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors duration-200">
                <Search className="w-7 h-7 text-teal-600 group-hover:text-white" />
              </div>
              <div>
                <span className="text-xs font-bold tracking-wider uppercase text-teal-600">
                  Step 2 • Real-time Status
                </span>
                <h3 className="text-xl font-bold text-navy-900 mt-1">
                  Track Application
                </h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                Check the current review stage of your request using your unique Application ID (e.g., APP-0001).
              </p>
            </div>

            <div className="pt-6">
              <Link to="/track" className="block">
                <Button variant="secondary" className="w-full justify-between" rightIcon={ArrowRight}>
                  Track Application
                </Button>
              </Link>
            </div>
          </div>

          {/* Card 3: Verify Certificate */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-md hover:shadow-xl transition-all duration-200 group flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-200">
                <Award className="w-7 h-7 text-emerald-600 group-hover:text-white" />
              </div>
              <div>
                <span className="text-xs font-bold tracking-wider uppercase text-emerald-700">
                  Step 3 • Public Trust
                </span>
                <h3 className="text-xl font-bold text-navy-900 mt-1">
                  Verify Certificate
                </h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                Instantly check the authenticity, validity, and revocation status of any issued Certificate ID (e.g., CERT-0001).
              </p>
            </div>

            <div className="pt-6">
              <Link to="/verify" className="block">
                <Button variant="teal" className="w-full justify-between" rightIcon={ArrowRight}>
                  Verify Certificate
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            System Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900">
            Engineered for Transparency & Governance
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            CredVault combines citizen convenience with administrative controls to prevent certificate forgery and streamline approvals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-navy-50 flex items-center justify-center text-navy-800">
              <Clock className="w-6 h-6 text-navy-800" />
            </div>
            <h3 className="text-lg font-bold text-navy-900">
              Secure Application Tracking
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Every submission receives a standardized identifier (APP-0001) with tamper-resistant audit timestamps and immediate progression through Pending, Approved, or Rejected states.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-teal-700">
              <ShieldCheck className="w-6 h-6 text-teal-600" />
            </div>
            <h3 className="text-lg font-bold text-navy-900">
              Digital Certificate Verification
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Public third-party verification allows employers, universities, and government bodies to independently validate certificates without login friction, displaying instant Valid or Revoked badges.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-700">
              <Users className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-lg font-bold text-navy-900">
              Administrative Governance
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Designated authorities can inspect detailed applicant profiles, approve and issue sequential certificates, or revoke credentials with immediate real-time registry synchronization.
            </p>
          </div>
        </div>
      </section>

      {/* Admin Callout Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-navy-900 to-navy-800 rounded-2xl p-8 sm:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg border border-navy-700">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-wider">
              <Lock className="w-4 h-4" />
              <span>Administrative Operations Portal</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold">
              Review Requests & Manage Credentials
            </h3>
            <p className="text-sm text-slate-300">
              Authorized administrators can log in using administrative credentials (<code className="bg-navy-950 px-2 py-0.5 rounded text-teal-300 font-mono">admin</code> / <code className="bg-navy-950 px-2 py-0.5 rounded text-teal-300 font-mono">AdminPass@123</code>) to review pending submissions, issue digital certificates, and revoke credentials.
            </p>
          </div>
          <div className="shrink-0">
            <Link to="/admin/login">
              <Button size="lg" variant="teal" rightIcon={ArrowRight}>
                Open Admin Portal
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
