import React, { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';

interface PageProps {
  flash: {
    success?: string;
    error?: string;
    warning?: string;
    info?: string;
  };
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  isExiting?: boolean;
}

export function SimpleToast() {
  const { props } = usePage<PageProps>();
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Add CSS animation keyframes
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideUpFromBottom {
        from {
          opacity: 0;
          transform: translateX(-50%) translateY(100%);
        }
        to {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
      }
      @keyframes slideDownToBottom {
        from {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
        to {
          opacity: 0;
          transform: translateX(-50%) translateY(100%);
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    const flash = props.flash;
    console.log('SimpleToast - Flash received:', flash);

    const newToasts: Toast[] = [];

    if (flash?.success) {
      newToasts.push({ id: Date.now() + 'success', message: flash.success, type: 'success' });
    }
    if (flash?.error) {
      newToasts.push({ id: Date.now() + 'error', message: flash.error, type: 'error' });
    }
    if (flash?.warning) {
      newToasts.push({ id: Date.now() + 'warning', message: flash.warning, type: 'warning' });
    }
    if (flash?.info) {
      newToasts.push({ id: Date.now() + 'info', message: flash.info, type: 'info' });
    }

    if (newToasts.length > 0) {
      console.log('SimpleToast - Adding toasts:', newToasts);
      setToasts(newToasts);

      // Auto-dismiss after 6 seconds with fade out
      setTimeout(() => {
        setToasts(current => 
          current.map(t => ({ ...t, isExiting: true }))
        );
        // Remove completely after fade out
        setTimeout(() => {
          setToasts([]);
        }, 500);
      }, 6000);
    }
  }, [props.flash]);

  const getToastColors = (type: string) => {
    switch (type) {
      case 'success':
        return { backgroundColor: '#f0fdf4', color: '#166534', borderColor: '#bbf7d0' };
      case 'error':
        return { backgroundColor: '#fef2f2', color: '#dc2626', borderColor: '#fecaca' };
      case 'warning':
        return { backgroundColor: '#fffbeb', color: '#d97706', borderColor: '#fed7aa' };
      case 'info':
        return { backgroundColor: '#eff6ff', color: '#2563eb', borderColor: '#bfdbfe' };
      default:
        return { backgroundColor: '#f9fafb', color: '#374151', borderColor: '#d1d5db' };
    }
  };

  console.log('SimpleToast - Rendering with toasts:', toasts);

  return (
    <div>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          onClick={() => setToasts(toasts.filter(t => t.id !== toast.id))}
          style={{
            position: 'fixed',
            bottom: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            padding: '16px 24px',
            borderRadius: '12px',
            cursor: 'pointer',
            minWidth: '280px',
            maxWidth: '400px',
            width: 'auto',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.05)',
            border: '1px solid',
            animation: toast.isExiting 
              ? 'slideDownToBottom 0.5s cubic-bezier(0.16, 1, 0.3, 1)' 
              : 'slideUpFromBottom 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
            ...getToastColors(toast.type)
          }}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="font-semibold capitalize text-base">{toast.type}</div>
              <div className="text-sm opacity-90">•</div>
              <div className="text-sm">{toast.message}</div>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setToasts(toasts.filter(t => t.id !== toast.id));
              }}
              className="text-xl font-bold hover:opacity-70 transition-opacity flex-shrink-0"
              style={{ opacity: 0.7 }}
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
