import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Award, 
  AlertTriangle,
  User, 
  Phone, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import StatusBadge from '../components/StatusBadge';
import Button from '../components/Button';
import ConfirmModal from '../components/ConfirmModal';
import { 
  getAdminApplications, 
  approveApplication, 
  rejectApplication 
} from '../services/api';

export default function AdminApplications() {
  const [applications, setApplications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // Confirmation Modal state for Rejecting
  const [rejectModalApp, setRejectModalApp] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('Documents do not match verification records');
  const [isProcessing, setIsProcessing] = useState(false);

  // Success message toast
  const [actionNotice, setActionNotice] = useState(null);

  const loadData = async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      const apps = await getAdminApplications();
      setApplications(apps);
    } catch (err) {
      console.error('Failed to load applications:', err);
      setLoadError(err.message || 'Failed to load applications from backend.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleIssue = async (app) => {
    if (app.status !== 'Pending') return;

    try {
      const result = await approveApplication(app.id);
      if (result.success) {
        await loadData();
        setActionNotice({
          type: 'success',
          text: `Certificate ${result.certificateId} successfully issued for ${app.fullName || app.name} (${app.id})!`,
        });
        setTimeout(() => setActionNotice(null), 6000);
      }
    } catch (err) {
      alert(err.message || 'Failed to approve application.');
    }
  };

  const handleOpenRejectModal = (app) => {
    setRejectModalApp(app);
    setRejectionReason('Documents do not match verification records');
  };

  const handleConfirmReject = async () => {
    if (!rejectModalApp) return;

    setIsProcessing(true);
    try {
      const result = await rejectApplication(rejectModalApp.id, rejectionReason);
      setRejectModalApp(null);
      if (result.success) {
        await loadData();
        setActionNotice({
          type: 'danger',
          text: `Application ${rejectModalApp.id} has been rejected.`,
        });
        setTimeout(() => setActionNotice(null), 6000);
      }
    } catch (err) {
      alert(err.message || 'Failed to reject application.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Metrics summary counts
  const totalCount = applications.length;
  const pendingCount = applications.filter((a) => a.status === 'Pending').length;
  const approvedCount = applications.filter((a) => a.status === 'Approved').length;
  const rejectedCount = applications.filter((a) => a.status === 'Rejected').length;

  // Filter & Search logic
  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      app.id.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
      app.fullName.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
      app.city.toLowerCase().includes(searchTerm.toLowerCase().trim());

    const matchesStatus =
      statusFilter === 'All' ? true : app.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout activeTab="applications">
      <div className="space-y-6">
        {/* Title & Quick Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
              Applications
            </h1>
            <p className="text-sm text-slate-500">
              Review incoming citizen requests, approve issuance, or reject ineligible files.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={loadData}
              leftIcon={RefreshCw}
            >
              Refresh Table
            </Button>
          </div>
        </div>

        {/* Action notification toast */}
        {actionNotice && (
          <div
            className={`p-4 rounded-xl text-sm font-medium flex items-center justify-between border shadow-sm animate-fadeIn ${
              actionNotice.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                : 'bg-rose-50 text-rose-900 border-rose-300'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {actionNotice.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <span>{actionNotice.text}</span>
            </div>
            <button
              onClick={() => setActionNotice(null)}
              className="text-slate-400 hover:text-slate-700 text-xs font-bold px-2 py-1"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* 4 Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Applications
              </span>
              <p className="text-2xl sm:text-3xl font-extrabold text-navy-900 mt-1">
                {totalCount}
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>

          {/* Pending */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
                Pending Review
              </span>
              <p className="text-2xl sm:text-3xl font-extrabold text-amber-700 mt-1">
                {pendingCount}
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          {/* Approved */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
                Approved & Issued
              </span>
              <p className="text-2xl sm:text-3xl font-extrabold text-blue-800 mt-1">
                {approvedCount}
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>

          {/* Rejected */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider">
                Rejected
              </span>
              <p className="text-2xl sm:text-3xl font-extrabold text-rose-700 mt-1">
                {rejectedCount}
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ID, Name or City..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-800 bg-white"
            />
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {['All', 'Pending', 'Approved', 'Rejected'].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  statusFilter === status
                    ? 'bg-navy-800 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Load Error Notice */}
        {loadError && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Database Connection Error</p>
              <p className="text-xs text-rose-700 mt-0.5">{loadError}</p>
            </div>
          </div>
        )}

        {/* Applications Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th scope="col" className="py-3.5 px-4 sm:px-6">Application ID</th>
                  <th scope="col" className="py-3.5 px-4">Applicant Name</th>
                  <th scope="col" className="py-3.5 px-4">Phone</th>
                  <th scope="col" className="py-3.5 px-4">Gender</th>
                  <th scope="col" className="py-3.5 px-4">City</th>
                  <th scope="col" className="py-3.5 px-4">State</th>
                  <th scope="col" className="py-3.5 px-4">Status</th>
                  <th scope="col" className="py-3.5 px-4 sm:px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {isLoading ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-slate-500">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-5 h-5 animate-spin text-teal-600" />
                        <span className="text-sm font-medium">Loading applications from database...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredApps.length > 0 ? (
                  filteredApps.map((app) => (
                    <tr
                      key={app.id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      {/* ID */}
                      <td className="py-3.5 px-4 sm:px-6 font-mono font-bold text-navy-900">
                        {app.id}
                      </td>

                      {/* Name */}
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {app.fullName}
                      </td>

                      {/* Phone */}
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-600">
                        +91 {app.phone}
                      </td>

                      {/* Gender */}
                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        {app.gender}
                      </td>

                      {/* City */}
                      <td className="py-3.5 px-4 text-slate-700">
                        {app.city}
                      </td>

                      {/* State */}
                      <td className="py-3.5 px-4 text-xs text-slate-600 max-w-[140px] truncate" title={app.state}>
                        {app.state}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <StatusBadge status={app.status} size="sm" />
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        {app.status === 'Pending' ? (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="teal"
                              size="sm"
                              onClick={() => handleIssue(app)}
                              title="Approve and issue digital certificate"
                              leftIcon={Award}
                            >
                              Issue
                            </Button>
                            <Button
                              variant="danger-outline"
                              size="sm"
                              onClick={() => handleOpenRejectModal(app)}
                              title="Reject application"
                            >
                              Reject
                            </Button>
                          </div>
                        ) : app.status === 'Approved' ? (
                          <div className="flex items-center justify-end gap-1.5 text-xs text-emerald-700 font-semibold">
                            <Award className="w-3.5 h-3.5" />
                            <Link
                              to={`/verify`}
                              state={{ certificateId: app.certificateId }}
                              className="font-mono text-teal-700 hover:underline bg-teal-50 px-2 py-0.5 rounded border border-teal-200 inline-flex items-center gap-1"
                              title="View certificate verification"
                            >
                              <span>{app.certificateId}</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">
                            Cannot Issue (Rejected)
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  /* Empty state */
                  <tr>
                    <td colSpan="8" className="py-12 text-center">
                      <div className="max-w-sm mx-auto space-y-2">
                        <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                        <h4 className="text-sm font-bold text-slate-800">
                          No applications found
                        </h4>
                        <p className="text-xs text-slate-500">
                          {searchTerm || statusFilter !== 'All'
                            ? 'No applications match your active search and filter criteria.'
                            : 'No applications have been submitted yet.'}
                        </p>
                        {(searchTerm || statusFilter !== 'All') && (
                          <button
                            onClick={() => {
                              setSearchTerm('');
                              setStatusFilter('All');
                            }}
                            className="text-xs font-semibold text-teal-600 hover:underline pt-2"
                          >
                            Clear active filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Reject Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(rejectModalApp)}
        title="Confirm Application Rejection"
        message={`Are you sure you want to reject application ${rejectModalApp?.id} for ${rejectModalApp?.fullName}? Once rejected, this application cannot receive a certificate.`}
        confirmText="Confirm Rejection"
        confirmVariant="danger"
        inputLabel="Reason for Rejection (Optional)"
        inputValue={rejectionReason}
        onInputChange={setRejectionReason}
        inputPlaceholder="e.g. Mismatched proof of residence"
        onConfirm={handleConfirmReject}
        onClose={() => setRejectModalApp(null)}
        isLoading={isProcessing}
      />
    </AdminLayout>
  );
}
