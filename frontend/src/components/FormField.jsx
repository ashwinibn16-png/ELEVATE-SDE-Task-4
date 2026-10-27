import React from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * Reusable FormField component
 * Provides accessible labels, input wrapper, and inline error messages.
 */
export default function FormField({
  label,
  id,
  name,
  error,
  required = false,
  hint,
  children,
  className = '',
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label
            htmlFor={id || name}
            className="block text-sm font-semibold text-slate-700"
          >
            {label}
            {required && <span className="text-rose-500 ml-1" aria-hidden="true">*</span>}
          </label>
          {hint && !error && (
            <span className="text-xs text-slate-500">{hint}</span>
          )}
        </div>
      )}
      
      {children}

      {error && (
        <div 
          className="flex items-center gap-1.5 text-xs text-rose-600 font-medium mt-1 animate-fadeIn"
          role="alert"
          id={id ? `${id}-error` : undefined}
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
