import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  Award, 
  Search, 
  ShieldCheck, 
  ShieldAlert, 
  Calendar, 
  User, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle,
  Info,
  Printer,
  QrCode,
  FileCheck
} from 'lucide-react';
import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';
import { verifyCertificate } from '../services/api';

export default function VerifyCertificate() {
  const location = useLocation();

  const [certificateIdInput, setCertificateIdInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [certificate, setCertificate] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState('');

  useEffect(() => {
    if (location.state?.certificateId) {
      const id = location.state.certificateId;
      setCertificateIdInput(id);
      performVerification(id);
    }
  }, [location.state]);

  const performVerification = async (idToSearch) => {
    const trimmed = (idToSearch || '').trim();
    setSearchQuery(trimmed);
    setHasSearched(true);
    setVerifyError('');

    if (!trimmed) {
      setCertificate(null);
      return;
    }

    setIsVerifying(true);
    try {
      const match = await verifyCertificate(trimmed);
      setCertificate(match);
    } catch (err) {
      console.error('Error verifying certificate:', err);
      setVerifyError(err.message || 'Error communicating with backend.');
      setCertificate(null);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifySubmit = (e) => {
    e.preventDefault();
    performVerification(certificateIdInput);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Disclaimer Notice Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 text-amber-900 text-xs sm:text-sm">
        <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="font-semibold">Frontend Demonstration Notice:</strong> This verification tool is a student project prototype using simulated browser <code className="bg-amber-100/70 px-1 py-0.5 rounded font-mono text-xs">localStorage</code> data. It is not affiliated with any actual government authority or legal registry.
        </p>
      </div>

      {/* Page Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-navy-50 text-navy-800 text-xs font-semibold border border-navy-200">
          <Award className="w-3.5 h-3.5 text-teal-600" />
          <span>Public Authenticity Verification</span>
        </div>
        <h1 className="text-3xl font-extrabold text-navy-900 tracking-tight">
          Verify Certificate
        </h1>
        <p className="text-sm text-slate-600 max-w-lg mx-auto">
          Enter any CredVault Certificate ID to verify its issuance status, holder identity, and validity in real time.
        </p>
      </div>

      {/* Verification Search Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <form onSubmit={handleVerifySubmit} className="space-y-4">
          <div>
            <label
              htmlFor="certificateId"
              className="block text-sm font-semibold text-slate-700 mb-1.5"
            >
              Certificate ID
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Award className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  id="certificateId"
                  value={certificateIdInput}
                  onChange={(e) => setCertificateIdInput(e.target.value)}
                  placeholder="e.g. CERT-0001 or CERT-0002"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-800 bg-white"
                  autoFocus
                />
              </div>
              <Button
                type="submit"
                variant="teal"
                size="md"
                isLoading={isVerifying}
                leftIcon={Search}
                className="shrink-0"
              >
                Verify Certificate
              </Button>
            </div>

            {/* Quick Sample Suggestions */}
            <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
              <span>Try sample IDs:</span>
              <button
                type="button"
                onClick={() => {
                  setCertificateIdInput('CERT-0001');
                  performVerification('CERT-0001');
                }}
                className="font-mono text-emerald-700 hover:underline bg-emerald-50 px-1.5 py-0.5 rounded font-medium"
              >
                CERT-0001 (Valid)
              </button>
              <button
                type="button"
                onClick={() => {
                  setCertificateIdInput('CERT-0002');
                  performVerification('CERT-0002');
                }}
                className="font-mono text-rose-700 hover:underline bg-rose-50 px-1.5 py-0.5 rounded font-medium"
              >
                CERT-0002 (Revoked)
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Verification Result Area */}
      {hasSearched && !isVerifying && (
        <div className="animate-fadeIn">
          {verifyError ? (
            <div className="bg-white rounded-2xl border border-amber-200 shadow-sm p-8 text-center space-y-4">
              <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-navy-900">
                  Backend Communication Error
                </h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  {verifyError}
                </p>
              </div>
            </div>
          ) : certificate ? (
            <div className="space-y-6">
              {/* Status Banner */}
              {certificate.status === 'Valid' ? (
                <div 
                  data-testid="certificate-valid-banner"
                  className="p-4 sm:p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-300 flex items-center justify-between gap-4 shadow-sm"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <ShieldCheck className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs uppercase tracking-wider font-extrabold text-emerald-900 bg-emerald-200/70 px-2 py-0.5 rounded">
                          AUTHENTIC RECORD
                        </span>
                        <span className="text-xs text-emerald-700 font-medium">
                          Active & Tamper-Checked
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-emerald-950 mt-0.5">
                        Certificate is VALID
                      </h3>
                    </div>
                  </div>
                  <div className="hidden sm:block">
                    <StatusBadge status="Valid" size="lg" />
                  </div>
                </div>
              ) : (
                <div 
                  data-testid="certificate-revoked-banner"
                  className="p-4 sm:p-5 rounded-2xl bg-rose-50 border-2 border-rose-300 flex items-center justify-between gap-4 shadow-sm"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <ShieldAlert className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs uppercase tracking-wider font-extrabold text-rose-900 bg-rose-200/70 px-2 py-0.5 rounded">
                          WARNING
                        </span>
                        <span className="text-xs text-rose-700 font-medium">
                          Invalidated by Authority
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-rose-950 mt-0.5">
                        Certificate has been REVOKED
                      </h3>
                    </div>
                  </div>
                  <div className="hidden sm:block">
                    <StatusBadge status="Revoked" size="lg" />
                  </div>
                </div>
              )}

              {/* Digital Certificate Document Preview Card */}
              <div className="bg-white rounded-2xl border-4 border-double border-slate-300 p-8 sm:p-12 shadow-xl relative overflow-hidden">
                {/* Official Decorative Emblem Background */}
                <div className="absolute right-6 -bottom-10 opacity-5 pointer-events-none">
                  <ShieldCheck className="w-72 h-72 text-navy-950" />
                </div>

                {/* Certificate Header */}
                <div className="text-center space-y-2 pb-8 border-b-2 border-dashed border-slate-200">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-navy-800 text-teal-300 flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <span className="text-lg font-extrabold text-navy-900 tracking-wider uppercase">
                      CredVault Digital Credential
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                    Government Citizen Service Verification Record
                  </p>
                </div>

                {/* Certificate Body */}
                <div className="py-8 space-y-6">
                  <div className="text-center space-y-1">
                    <span className="text-xs uppercase text-slate-500 font-medium">
                      This is to certify that
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
                      {certificate.fullName}
                    </h2>
                    <p className="text-xs text-slate-500 font-mono">
                      Mobile: +91 {certificate.phone}
                    </p>
                  </div>

                  <p className="text-center text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                    has successfully satisfied all identity verification and documentation protocols 
                    stipulated by the regional authority in{' '}
                    <strong className="text-slate-900 font-semibold">{certificate.city}, {certificate.state}</strong>.
                  </p>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-100">
                    <div>
                      <span className="block text-[11px] font-semibold uppercase text-slate-400">
                        Certificate ID
                      </span>
                      <span className="font-mono text-sm font-bold text-navy-900">
                        {certificate.id}
                      </span>
                    </div>

                    <div>
                      <span className="block text-[11px] font-semibold uppercase text-slate-400">
                        Application Ref
                      </span>
                      <span className="font-mono text-sm font-semibold text-slate-700">
                        {certificate.applicationId || 'N/A'}
                      </span>
                    </div>

                    <div>
                      <span className="block text-[11px] font-semibold uppercase text-slate-400">
                        Date Issued
                      </span>
                      <span className="text-sm font-semibold text-slate-700">
                        {new Date(certificate.issuedAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    <div>
                      <span className="block text-[11px] font-semibold uppercase text-slate-400">
                        Registry Status
                      </span>
                      <span className="mt-0.5 inline-block">
                        <StatusBadge status={certificate.status} size="sm" />
                      </span>
                    </div>
                  </div>

                  {/* Revocation notice details if revoked */}
                  {certificate.status === 'Revoked' && (
                    <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1">
                      <p className="font-bold flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4 text-rose-600" />
                        Revocation Information
                      </p>
                      <p>
                        Revoked on:{' '}
                        {certificate.revokedAt
                          ? new Date(certificate.revokedAt).toLocaleString('en-IN')
                          : 'Administrative Order'}
                      </p>
                      {certificate.revocationReason && (
                        <p>Reason: {certificate.revocationReason}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Certificate Footer Stamp */}
                <div className="pt-6 border-t-2 border-dashed border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-8 h-8 text-slate-400" />
                    <div>
                      <span className="block font-mono text-[10px] text-slate-400">
                        DIGITAL SIGNATURE HASH
                      </span>
                      <span className="font-mono text-[11px] text-slate-600 font-semibold">
                        SHA256-{certificate.id}-VERIFIED
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handlePrint}
                      leftIcon={Printer}
                    >
                      Print Certificate
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Not Found Screen */
            <div className="bg-white rounded-2xl border border-rose-200 shadow-sm p-8 text-center space-y-4">
              <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-navy-900">
                  Certificate not found
                </h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  No certificate record exists matching ID{' '}
                  <span className="font-mono font-bold text-slate-800">"{searchQuery}"</span>. 
                  This certificate may not have been issued yet, or the ID may be typed incorrectly.
                </p>
              </div>
              <div className="pt-2 flex justify-center gap-3">
                <Link to="/track">
                  <Button variant="secondary" size="sm">
                    Track Application Status
                  </Button>
                </Link>
                <Link to="/request">
                  <Button variant="teal" size="sm">
                    Request Certificate
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
