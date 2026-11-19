'use client';

import { CheckCircle2, X, AlertCircle, Info } from 'lucide-react';
import { useToast } from '../../context/AppContext';

const icons = { success: CheckCircle2, error: AlertCircle, info: Info };

export function ToastViewport() {
  const { toasts, removeToast } = useToast();
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex w-[min(92vw,390px)] flex-col gap-2" aria-live="polite">
      {toasts.map((item) => {
        const Icon = icons[item.type] || Info;
        return (
          <div key={item.id} className="surface flex items-start gap-3 rounded-2xl border border-line p-4 shadow-soft animate-fade-up">
            <Icon size={19} className={item.type === 'error' ? 'mt-0.5 text-rose-500' : item.type === 'success' ? 'mt-0.5 text-teal-500' : 'mt-0.5 text-royal'} />
            <p className="flex-1 text-sm font-medium text-copy">{item.message}</p>
            <button type="button" onClick={() => removeToast(item.id)} className="text-muted transition hover:text-copy" aria-label="Dismiss notification"><X size={16} /></button>
          </div>
        );
      })}
    </div>
  );
}
