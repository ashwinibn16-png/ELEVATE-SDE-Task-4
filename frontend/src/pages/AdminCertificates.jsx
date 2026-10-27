import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Award, 
  Search, 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle, 
  ExternalLink,
  RefreshCw,
  Calendar,
  User,
  Phone
} from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import StatusBadge from '../components/StatusBadge';
import Button from '../components/Button';
import ConfirmModal from '../components/ConfirmModal';
import { getAdminCertificates, revokeCertificate } from '../services/api';

export default function AdminCertificates() {
  const [certificates, setCertificates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // Confirmation Modal state for Revoking
  const [revokeModalCert, setRevokeModalCert] = useState(null);
  const [revocationReason, setRevocationReason] = useState('Verification audit discrepancy');
  const [isProcessing, setIsProcessing] = useState(false);

  // Success message toast
  const [actionNotice, setActionNotice] = useState(null);

  const loadData = async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      const certs = await getAdminCertificates();
      setCertificates(certs);
    } catch (err) {
      console.error('Failed to load certificates:', err);
      setLoadError(err.message || 'Failed to load certificates from backend.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenRevokeModal = (cert) => {
    setRevokeModalCert(cert);
    setRevocationReason('Verification audit discrepancy');
  };

  const handleConfirmRevoke = async () => {
    if (!revokeModalCert) return;

    setIsProcessing(true);
    try {
      const result = await revokeCertificate(revokeModalCert.id);
      setRevokeModalCert(null);
      if (result.success) {
        await loadData();
        setActionNotice({
          type: 'danger',
          text: `Certificate ${revokeModalCert.id} has been revoked. Public verification will immediately reflect this status.`,
        });
        setTimeout(() => setActionNotice(null), 6000);
      }
    } catch (err) {
      alert(err.message || 'Failed to revoke certificate.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Metrics summary
  const totalCount = certificates.length;
  const validCount = certificates.filter((c) => c.status === 'Valid').length;
  const revokedCount = certificates.filter((c) => c.status === 'Revoked').length;

  // Filter & Search logic
  const filteredCerts = certificates.filter((cert) => {
    const matchesSearch =
      cert.id.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
      cert.fullName.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
      cert.city.toLowerCase().includes(searchTerm.toLowerCase().trim());

    const matchesStatus =
      statusFilter === 'All' ? true : cert.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout activeTab="certificates">
      <div className="space-y-6">
        {/* Title & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
              Certificates Registry
            </h1>
            <p className="text-sm text-slate-500">
              Manage digital credentials, verify active certificates, and enforce revocation orders.
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
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
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

        {/* 3 Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Total */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Issued
              </span>
              <p className="text-2xl sm:text-3xl font-extrabold text-navy-900 mt-1">
                {totalCount}
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>

          {/* Valid */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                Active & Valid
              </span>
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-700 mt-1">
                {validCount}
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>

          {/* Revoked */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider">
                Revoked Credentials
              </span>
              <p className="text-2xl sm:text-3xl font-extrabold text-rose-700 mt-1">
                {revokedCount}
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
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
            {['All', 'Valid', 'Revoked'].map((status) => (
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

        {/* Certificates Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th scope="col" className="py-3.5 px-4 sm:px-6">Certificate ID</th>
                  <th scope="col" className="py-3.5 px-4">Holder Name</th>
                  <th scope="col" className="py-3.5 px-4">Phone</th>
                  <th scope="col" className="py-3.5 px-4">City</th>
                  <th scope="col" className="py-3.5 px-4">State</th>
                  <th scope="col" className="py-3.5 px-4">Issued On</th>
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
                        <span className="text-sm font-medium">Loading certificates from database...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredCerts.length > 0 ? (
                  filteredCerts.map((cert) => (
                    <tr
                      key={cert.id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      {/* ID */}
                      <td className="py-3.5 px-4 sm:px-6 font-mono font-bold text-navy-900">
                        <Link
                          to="/verify"
                          state={{ certificateId: cert.id }}
                          className="hover:text-teal-600 inline-flex items-center gap-1 group"
                          title="Open public verification view"
                        >
                          <span>{cert.id}</span>
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      </td>

                      {/* Name */}
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {cert.fullName}
                      </td>

                      {/* Phone */}
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-600">
                        +91 {cert.phone}
                      </td>

                      {/* City */}
                      <td className="py-3.5 px-4 text-slate-700">
                        {cert.city}
                      </td>

                      {/* State */}
                      <td className="py-3.5 px-4 text-xs text-slate-600 max-w-[140px] truncate" title={cert.state}>
                        {cert.state}
                      </td>

                      {/* Issued On */}
                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        {new Date(cert.issuedAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <StatusBadge status={cert.status} size="sm" />
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        {cert.status === 'Valid' ? (
                          <Button
                            variant="danger-outline"
                            size="sm"
                            onClick={() => handleOpenRevokeModal(cert)}
                            title="Revoke certificate"
                          >
                            Revoke
                          </Button>
                        ) : (
                          <span className="text-xs text-rose-500 font-semibold bg-rose-50 px-2.5 py-1 rounded border border-rose-200">
                            Revoked
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
                        <Award className="w-10 h-10 text-slate-300 mx-auto" />
                        <h4 className="text-sm font-bold text-slate-800">
                          No certificates found
                        </h4>
                        <p className="text-xs text-slate-500">
                          {searchTerm || statusFilter !== 'All'
                            ? 'No certificates match your active search and filter criteria.'
                            : 'No certificates have been issued yet. Go to Applications to review pending requests.'}
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

      {/* Revoke Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(revokeModalCert)}
        title="Confirm Certificate Revocation"
        message={`Are you sure you want to revoke Certificate ${revokeModalCert?.id} issued to ${revokeModalCert?.fullName}? This action is immediate and will cause public verification to flag this credential as REVOKED.`}
        confirmText="Confirm Revocation"
        confirmVariant="danger"
        inputLabel="Reason for Revocation (Optional)"
        inputValue={revocationReason}
        onInputChange={setRevocationReason}
        inputPlaceholder="e.g. Identity discrepancy or judicial order"
        onConfirm={handleConfirmRevoke}
        onClose={() => setRevokeModalCert(null)}
        isLoading={isProcessing}
      />
    </AdminLayout>
  );
}
