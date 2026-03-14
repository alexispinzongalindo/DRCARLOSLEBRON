type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

type Listener = (toasts: ToastMessage[]) => void;

let toasts: ToastMessage[] = [];
let counter = 0;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach(l => l([...toasts]));
}

function add(message: string, type: ToastType) {
  const id = ++counter;
  toasts = [...toasts, { id, message, type }];
  notify();
  setTimeout(() => {
    toasts = toasts.filter(t => t.id !== id);
    notify();
  }, 4000);
}

export const toast = {
  success: (msg: string) => add(msg, 'success'),
  error: (msg: string) => add(msg, 'error'),
  info: (msg: string) => add(msg, 'info'),
  subscribe: (fn: Listener) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};
