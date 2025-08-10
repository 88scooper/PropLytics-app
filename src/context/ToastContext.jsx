"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

const ToastContext = createContext({ addToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, { type = "success", duration = 3500 } = {}) => {
    const id = Math.random().toString(36).slice(2);
    const toast = { id, message, type };
    setToasts((prev) => [toast, ...prev]);
    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }
    return id;
  }, [removeToast]);

  const value = useMemo(() => ({ addToast, removeToast }), [addToast, removeToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast viewport */}
      <div className="fixed right-4 top-4 z-[100] flex w-[min(380px,calc(100vw-32px))] flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`rounded-md border px-4 py-3 text-sm shadow-md backdrop-blur ${
              t.type === "error"
                ? "border-red-300/50 bg-red-50/80 text-red-900 dark:border-red-400/30 dark:bg-red-900/30 dark:text-red-100"
                : "border-emerald-300/50 bg-emerald-50/80 text-emerald-900 dark:border-emerald-400/30 dark:bg-emerald-900/30 dark:text-emerald-100"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}


