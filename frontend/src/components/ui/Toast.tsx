import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface ToastProps {
  message: string;
  action?: { label: string; onClick: () => void };
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, action, onClose, duration = 4000 }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, duration);
    return () => clearTimeout(t);
  }, [duration, onClose]);

  return (
    <div
      className={cn(
        "flex items-center gap-3 bg-slate-900 dark:bg-slate-700 text-white px-4 py-3 rounded-lg shadow-lg",
        "transition-all duration-300",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      )}
    >
      <span className="text-sm flex-1">{message}</span>
      {action && (
        <button
          onClick={() => { action.onClick(); onClose(); }}
          className="text-brand-400 text-sm font-medium hover:text-brand-300 transition-colors"
        >
          {action.label}
        </button>
      )}
      <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
        <X size={14} />
      </button>
    </div>
  );
}

interface ToastItem {
  id: string;
  message: string;
  action?: { label: string; onClick: () => void };
}

let toastListeners: ((toast: ToastItem) => void)[] = [];

export function showToast(message: string, action?: ToastItem["action"]) {
  const id = Math.random().toString(36).slice(2);
  toastListeners.forEach((l) => l({ id, message, action }));
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const listener = (toast: ToastItem) => {
      setToasts((prev) => [...prev, toast]);
    };
    toastListeners.push(listener);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== listener);
    };
  }, []);

  const remove = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 flex flex-col gap-2 z-50 w-full max-w-sm px-4">
      {toasts.map((t) => (
        <Toast key={t.id} message={t.message} action={t.action} onClose={() => remove(t.id)} />
      ))}
    </div>
  );
}
