import { useEffect, useState } from 'react';
import { toast, type ToastMessage } from '../../lib/toast';

export function Toaster() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => toast.subscribe(setToasts), []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`flex items-start gap-3 px-4 py-3 rounded-lg shadow-lg text-sm font-medium max-w-sm pointer-events-auto
            ${t.type === 'success' ? 'bg-green-600 text-white' : ''}
            ${t.type === 'error'   ? 'bg-red-600 text-white'   : ''}
            ${t.type === 'info'    ? 'bg-blue-600 text-white'  : ''}
          `}
        >
          <span className="text-lg leading-none select-none">
            {t.type === 'success' && '✓'}
            {t.type === 'error'   && '✕'}
            {t.type === 'info'    && 'ℹ'}
          </span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
