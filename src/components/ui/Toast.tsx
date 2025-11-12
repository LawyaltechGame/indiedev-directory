import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface ToastProps {
  id: string;
  title: string;
  description: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onRemove: (id: string) => void;
}

export function Toast({ id, title, description, type, onRemove }: ToastProps) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev > 0) {
          return prev - 2;
        }
        clearInterval(timer);
        onRemove(id);
        return 0;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [id, onRemove]);

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
  }[type];

  const iconMap = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className="min-w-[300px] pointer-events-auto"
    >
      <div className={`rounded-lg shadow-lg overflow-hidden ${bgColor} bg-opacity-10 border border-opacity-20 backdrop-blur-sm`}>
        <div className="p-4">
          <div className="flex items-start">
            <div className="shrink-0">
              <span role="img" aria-label={type}>
                {iconMap[type]}
              </span>
            </div>
            <div className="ml-3 w-0 flex-1">
              <p className="text-sm font-medium text-white">{title}</p>
              <p className="mt-1 text-sm text-gray-200">{description}</p>
            </div>
            <div className="ml-4 shrink-0 flex">
              <button
                onClick={() => onRemove(id)}
                className="inline-flex text-white hover:text-gray-200 focus:outline-none"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
        <div className="h-1 w-full bg-white bg-opacity-20">
          <div
            className={`h-full ${bgColor}`}
            style={{ width: `${progress}%`, transition: 'width 100ms linear' }}
          />
        </div>
      </div>
    </motion.div>
  );
}