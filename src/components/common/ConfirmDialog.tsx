import { useEffect } from 'react';
import { AlertTriangle, Loader2, X } from 'lucide-react';

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  warning?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  warning,
  confirmLabel = 'Confirmă',
  cancelLabel = 'Renunță',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) onCancel();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, loading, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={() => !loading && onCancel()}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-error-50 text-error-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="flex-1 pt-0.5">
              <h2 className="text-lg font-extrabold text-slate-900">{title}</h2>
              <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">{message}</p>
              {warning && (
                <p className="mt-2 text-sm font-medium text-error-600 leading-relaxed">{warning}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors disabled:opacity-50"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="btn-secondary flex-1 text-sm py-2.5"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="btn-danger flex-1 text-sm py-2.5"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
