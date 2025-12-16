import React from 'react';
import { useToastContext } from '@/contexts/ToastContext';

const toastStyles = {
    success: 'bg-accent-green text-white border-green-600',
    error: 'bg-accent-red text-white border-red-600',
    info: 'bg-bg-card text-white border-border-light',
    syncing: 'bg-white text-gray-900 border-gray-300'
};

export const Toast: React.FC = () => {
    const { toasts, removeToast } = useToastContext();

    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`
            flex items-center gap-2 px-3 py-1.5 rounded-md border shadow-lg
            animate-slideUp cursor-pointer transition-transform hover:scale-105
            text-xs font-medium
            ${toastStyles[toast.type]}
          `}
                    onClick={() => removeToast(toast.id)}
                >
                    {toast.type === 'syncing' && (
                        <span className="w-3 h-3 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                    )}
                    {toast.type === 'success' && (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    )}
                    {toast.type === 'error' && (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    )}
                    <span>{toast.message}</span>
                </div>
            ))}
        </div>
    );
};
