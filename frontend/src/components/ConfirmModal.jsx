import React, { useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import Button from './Button';

/**
 * Reusable Confirmation & Action Modal
 */
export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'danger',
  onConfirm,
  onClose,
  inputLabel,
  inputValue,
  onInputChange,
  inputPlaceholder,
  isLoading = false,
}) {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-xs animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-headline"
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-scaleUp"
      >
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  confirmVariant === 'danger'
                    ? 'bg-rose-100 text-rose-600'
                    : 'bg-teal-100 text-teal-700'
                }`}
              >
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3
                id="modal-headline"
                className="text-lg font-bold text-slate-900 leading-snug"
              >
                {title}
              </h3>
            </div>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="mt-3 text-sm text-slate-600 leading-relaxed">
            {message}
          </p>

          {inputLabel && (
            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {inputLabel}
              </label>
              <input
                type="text"
                value={inputValue || ''}
                onChange={(e) => onInputChange && onInputChange(e.target.value)}
                placeholder={inputPlaceholder}
                className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-800"
                autoFocus
              />
            </div>
          )}
        </div>

        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex justify-end gap-2.5">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={confirmVariant}
            size="sm"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
