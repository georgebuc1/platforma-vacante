import { useEffect, useState, useCallback } from 'react';
import { CheckCircle, X, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

let listeners: ((toast: Toast) => void)[] = [];

export function showToast(message: string, type: ToastType = 'success') {
  const toast: Toast = { id: `${Date.now()}-${Math.random()}`, message, type };
  listeners.forEach((l) => l(toast));
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((t) => t.filter((toast) => toast.id !== id));
  }, []);

  useEffect(() => {
    const listener = (toast: Toast) => {
      setToasts((t) => [...t, toast]);
      setTimeout(() => remove(toast.id), 4000);
    };
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, [remove]);

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-success-600" />,
    error: <AlertCircle className="h-5 w-5 text-error-600" />,
    info: <Info className="h-5 w-5 text-brand-600" />,
  };

  const bg = {
    success: 'bg-white border-l-4 border-success-500',
    error: 'bg-white border-l-4 border-error-500',
    info: 'bg-white border-l-4 border-brand-500',
  };

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 rounded-xl shadow-card-hover p-4 animate-slide-up ${bg[toast.type]}`}
        >
          {icons[toast.type]}
          <p className="flex-1 text-sm font-medium text-slate-700">{toast.message}</p>
          <button onClick={() => remove(toast.id)} className="text-slate-400 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
