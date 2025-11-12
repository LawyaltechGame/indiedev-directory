import { AnimatePresence } from 'framer-motion';
import { Toast } from './Toast';
import { useToast } from '../../hooks/useToast';

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-0 right-0 p-4 z-50 pointer-events-none max-h-screen overflow-hidden flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast key={toast.id} onRemove={removeToast} {...toast} />
        ))}
      </AnimatePresence>
    </div>
  );
}