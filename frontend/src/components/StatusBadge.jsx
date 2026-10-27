import React from 'react';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  ShieldAlert 
} from 'lucide-react';

/**
 * Status Badge Component
 * Renders standardized badges for applications and certificates:
 * - Pending, Approved, Rejected (Application statuses)
 * - Valid, Revoked (Certificate statuses)
 */
export default function StatusBadge({ status, size = 'md', className = '' }) {
  const normStatus = (status || '').toLowerCase().trim();

  let config = {
    bg: 'bg-slate-100 text-slate-700 border-slate-300',
    icon: Clock,
    label: status || 'Unknown',
  };

  switch (normStatus) {
    case 'pending':
      config = {
        bg: 'bg-amber-50 text-amber-800 border-amber-300',
        icon: Clock,
        label: 'Pending',
      };
      break;
    case 'approved':
      config = {
        bg: 'bg-blue-50 text-blue-800 border-blue-300',
        icon: CheckCircle2,
        label: 'Approved',
      };
      break;
    case 'rejected':
      config = {
        bg: 'bg-rose-50 text-rose-800 border-rose-300',
        icon: XCircle,
        label: 'Rejected',
      };
      break;
    case 'valid':
      config = {
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
        icon: ShieldCheck,
        label: 'VALID',
      };
      break;
    case 'revoked':
      config = {
        bg: 'bg-red-50 text-red-800 border-red-300',
        icon: ShieldAlert,
        label: 'REVOKED',
      };
      break;
    default:
      config = {
        bg: 'bg-gray-100 text-gray-700 border-gray-300',
        icon: Clock,
        label: status,
      };
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs sm:text-sm px-2.5 py-1 gap-1.5',
    lg: 'text-sm sm:text-base px-3.5 py-1.5 gap-2 font-semibold',
  };

  const IconComponent = config.icon;

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border shadow-xs ${config.bg} ${sizeClasses[size] || sizeClasses.md} ${className}`}
    >
      <IconComponent className={size === 'lg' ? 'w-5 h-5 shrink-0' : size === 'sm' ? 'w-3 h-3 shrink-0' : 'w-4 h-4 shrink-0'} />
      <span>{config.label}</span>
    </span>
  );
}
