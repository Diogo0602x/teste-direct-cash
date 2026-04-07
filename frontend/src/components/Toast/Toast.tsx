'use client';

import React, { useEffect, useRef } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import type { Toast } from '@/context';

type ToastItemProps = {
  toast: Toast;
  onClose: (id: string) => void;
};

const ICON = {
  success: <CheckCircle size={18} className="text-green-500 flex-shrink-0" />,
  error: <XCircle size={18} className="text-red-500 flex-shrink-0" />,
  warning: <AlertCircle size={18} className="text-amber-500 flex-shrink-0" />,
  info: <Info size={18} className="text-sky-500 flex-shrink-0" />,
};

const BG = {
  success: 'bg-white border-green-200',
  error: 'bg-white border-red-200',
  warning: 'bg-white border-amber-200',
  info: 'bg-white border-sky-200',
};

const BAR = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  warning: 'bg-amber-500',
  info: 'bg-sky-500',
};

const ToastItem: React.FC<ToastItemProps> = ({ toast, onClose }) => {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!barRef.current) return;
    const bar = barRef.current;
    bar.style.transform = 'scaleX(1)';
    bar.style.transition = `transform ${toast.duration ?? 4000}ms linear`;
    const raf = requestAnimationFrame(() => {
      bar.style.transform = 'scaleX(0)';
    });
    return () => cancelAnimationFrame(raf);
  }, [toast.duration]);

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`relative flex w-full max-w-sm items-start gap-3 overflow-hidden rounded-xl border shadow-lg px-4 py-3 ${BG[toast.type]}`}
    >
      {ICON[toast.type]}
      <p className="flex-1 text-sm text-neutral-800 leading-snug">{toast.message}</p>
      <button
        onClick={() => onClose(toast.id)}
        className="flex-shrink-0 text-neutral-400 hover:text-neutral-600 transition-colors mt-0.5"
        aria-label="Fechar"
      >
        <X size={14} />
      </button>
      <div
        ref={barRef}
        className={`absolute bottom-0 left-0 h-0.5 w-full origin-left ${BAR[toast.type]}`}
        style={{ transform: 'scaleX(1)' }}
      />
    </div>
  );
};

type ToastContainerProps = {
  toasts: Toast[];
  onClose: (id: string) => void;
};

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-label="Notificações"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 items-end"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onClose={onClose} />
      ))}
    </div>
  );
};

ToastContainer.displayName = 'ToastContainer';
