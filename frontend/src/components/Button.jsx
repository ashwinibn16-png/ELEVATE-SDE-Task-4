import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Reusable Button Component
 */
export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  onClick,
  className = '',
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  ...props
}) {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-55 disabled:cursor-not-allowed select-none active:scale-[0.99]';

  const variantClasses = {
    primary:
      'bg-navy-800 text-white hover:bg-navy-900 focus:ring-navy-800 shadow-sm hover:shadow border border-navy-900/10',
    teal:
      'bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-600 shadow-sm hover:shadow border border-teal-700/20',
    secondary:
      'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus:ring-slate-400 shadow-xs',
    danger:
      'bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-600 shadow-sm hover:shadow',
    'danger-outline':
      'bg-white text-rose-600 border border-rose-300 hover:bg-rose-50 hover:border-rose-400 focus:ring-rose-500',
    ghost:
      'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-400',
  };

  const sizeClasses = {
    sm: 'text-xs sm:text-sm px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseClasses} ${variantClasses[variant] || variantClasses.primary} ${sizeClasses[size] || sizeClasses.md} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        LeftIcon && <LeftIcon className="w-4 h-4 shrink-0" />
      )}
      <span>{children}</span>
      {!isLoading && RightIcon && <RightIcon className="w-4 h-4 shrink-0" />}
    </button>
  );
}
