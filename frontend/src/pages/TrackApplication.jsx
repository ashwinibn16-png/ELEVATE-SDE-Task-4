import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  Search, 
  FileText, 
  Calendar, 
  User, 
  Phone, 
  MapPin, 
  Award, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  XCircle,
  ArrowRight
} from 'lucide-react';
import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';
import { trackApplication } from '../services/api';

export default function TrackApplication() {
  const location = useLocation();

  const [applicationIdInput, setApplicationIdInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [application, setApplication] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  // If navigated from Request screen with an Application ID in location.state
  useEffect(() => {
    if (location.state?.applicationId) {
      const id = location.state.applicationId;
      setApplicationIdInput(id);
      performSearch(id);
    }
  }, [location.state]);

  const performSearch = async (idToSearch) => {
    const trimmed = (idToSearch || '').trim();
    setSearchQuery(trimmed);
    setHasSearched(true);
    setSearchError('');

    if (!trimmed) {
      setApplication(null);
      return;
    }

    setIsSearching(true);
    try {
      const match = await trackApplication(trimmed);
      setApplication(match);
    } catch (err) {
      console.error('Error tracking application:', err);
      setSearchError(err.message || 'Error communicating with backend.');
      setApplication(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    performSearch(applicationIdInput);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-navy-50 text-navy-800 text-xs font-semibold border border-navy-200">
          <Search className="w-3.5 h-3.5 text-teal-600" />
          <span>Real-time Application Status</span>
        </div>
        <h1 className="text-3xl font-extrabold text-navy-900 tracking-tight">
          Track Application
        </h1>
        <p className="text-sm text-slate-600 max-w-lg mx-auto">
          Enter your Application ID below to check the real-time status of your certificate request.
        </p>
      </div>

      {/* Search Input Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="applicationId"
              className="block text-sm font-semibold text-slate-700 mb-1.5"
            >
              Application ID
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <FileText className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  id="applicationId"
                  value={applicationIdInput}
                  onChange={(e) => setApplicationIdInput(e.target.value)}
                  placeholder="e.g. APP-0001 or APP-0002"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-800 bg-white"
                  autoFocus
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSearching}
                leftIcon={Search}
                className="shrink-0"
              >
                Track Application
              </Button>
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
              <span>Sample IDs to try:</span>
              <button
                type="button"
                onClick={() => {
                  setApplicationIdInput('APP-0001');
                  performSearch('APP-0001');
                }}
                className="font-mono text-teal-700 hover:underline bg-teal-50 px-1.5 py-0.5 rounded"
              >
                APP-0001 (Approved)
              </button>
              <button
                type="button"
                onClick={() => {
                  setApplicationIdInput('APP-0002');
                  performSearch('APP-0002');
                }}
                className="font-mono text-amber-700 hover:underline bg-amber-50 px-1.5 py-0.5 rounded"
              >
                APP-0002 (Pending)
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Results Section */}
      {hasSearched && !isSearching && (
        <div className="animate-fadeIn">
          {searchError ? (
            <div className="bg-white rounded-2xl border border-amber-200 shadow-sm p-8 text-center space-y-4">
              <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-navy-900">
                  Backend Communication Error
                </h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  {searchError}
                </p>
              </div>
            </div>
          ) : application ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden space-y-6 p-6 sm:p-8">
              {/* Application Top Summary */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase font-bold tracking-wider text-slate-500">
                      Application ID
                    </span>
                    {application.isSample && (
                      <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                        Demo Record
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl font-mono font-extrabold text-navy-900 mt-0.5">
                    {application.id}
                  </h2>
                </div>
                <div>
                  <StatusBadge status={application.status} size="lg" />
                </div>
              </div>

              {/* Progress Stepper Indicator */}
              <div className="py-2">
                <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">
                  Application Progress
                </span>
                <div className="relative">
                  {/* Progress Line */}
                  <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 -z-0">
                    <div
                      className={`h-full transition-all duration-500 ${
                        application.status === 'Approved'
                          ? 'bg-blue-600 w-full'
                          : application.status === 'Rejected'
                          ? 'bg-rose-500 w-full'
                          : 'bg-amber-500 w-1/2'
                      }`}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between relative z-10">
                    {/* Step 1: Submitted */}
                    <div className="flex flex-col items-center text-center">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold ring-4 ring-white">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-semibold text-slate-800 mt-2">
                        Submitted
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(application.submittedAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                        })}
                      </span>
                    </div>

                    {/* Step 2: In Review */}
                    <div className="flex flex-col items-center text-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ring-4 ring-white ${
                          application.status === 'Pending'
                            ? 'bg-amber-500 text-white animate-pulse'
                            : 'bg-blue-600 text-white'
                        }`}
                      >
                        <Clock className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-semibold text-slate-800 mt-2">
                        Under Review
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {application.status === 'Pending' ? 'In Progress' : 'Completed'}
                      </span>
                    </div>

                    {/* Step 3: Decision */}
                    <div className="flex flex-col items-center text-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ring-4 ring-white ${
                          application.status === 'Approved'
                            ? 'bg-emerald-600 text-white'
                            : application.status === 'Rejected'
                            ? 'bg-rose-600 text-white'
                            : 'bg-slate-200 text-slate-400'
                        }`}
                      >
                        {application.status === 'Approved' ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : application.status === 'Rejected' ? (
                          <XCircle className="w-4 h-4" />
                        ) : (
                          <Award className="w-4 h-4" />
                        )}
                      </div>
                      <span className="text-xs font-semibold text-slate-800 mt-2">
                        {application.status === 'Rejected' ? 'Rejected' : 'Approved'}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {application.status === 'Approved'
                          ? 'Certificate Issued'
                          : application.status === 'Rejected'
                          ? 'Review Failed'
                          : 'Awaiting Action'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Application Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-xs text-slate-500 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    Applicant Name
                  </span>
                  <p className="text-sm font-bold text-slate-900">
                    {application.fullName}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    Registered Mobile
                  </span>
                  <p className="text-sm font-bold text-slate-900 font-mono">
                    +91 {application.phone}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-xs text-slate-500 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    Location
                  </span>
                  <p className="text-sm font-semibold text-slate-900">
                    {application.city}, {application.state}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Submission Date
                  </span>
                  <p className="text-sm font-semibold text-slate-900">
                    {new Date(application.submittedAt).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </p>
                </div>
              </div>

              {/* Rejection Note if Rejected */}
              {application.status === 'Rejected' && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    <span>Rejection Notice</span>
                  </div>
                  <p className="text-xs text-rose-700">
                    {application.rejectionReason || 'The application did not fulfill eligibility requirements.'}
                  </p>
                </div>
              )}

              {/* Certificate Issued Banner if Approved */}
              {application.status === 'Approved' && application.certificateId && (
                <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center shrink-0">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-teal-800">
                        Certificate Issued:
                      </span>
                      <p className="text-base font-mono font-bold text-teal-950">
                        {application.certificateId}
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/verify"
                    state={{ certificateId: application.certificateId }}
                    className="w-full sm:w-auto"
                  >
                    <Button variant="teal" size="sm" rightIcon={ArrowRight}>
                      Verify Certificate Now
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            /* Not Found Screen */
            <div className="bg-white rounded-2xl border border-rose-200 shadow-sm p-8 text-center space-y-4">
              <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-navy-900">
                  Application not found
                </h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  No application record exists matching ID{' '}
                  <span className="font-mono font-bold text-slate-800">"{searchQuery}"</span>. 
                  Please check the ID format (e.g., APP-0001) and try again.
                </p>
              </div>
              <div className="pt-2">
                <Link to="/request">
                  <Button variant="secondary" size="sm">
                    Submit New Application
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
