import { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg';
  showCloseButton?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  children,
  title,
  subtitle,
  size = 'md',
  showCloseButton = true,
}: ModalProps) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg'
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-100 p-5" 
      onClick={onClose}
    >
      <div 
        className={`bg-[rgba(20,28,42,0.95)] backdrop-blur-[20px] border border-white/8 rounded-2xl w-full ${sizeClasses[size]} p-8 relative shadow-[0_25px_50px_rgba(0,0,0,0.5)] max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        {showCloseButton && (
          <button
            className="absolute top-4 right-4 bg-white/10 border-0 text-white w-8 h-8 rounded-lg cursor-pointer text-xl transition-all duration-200 hover:bg-white/20"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        )}

        {(title || subtitle) && (
          <div className="mb-6">
            {title && (
              <h2 className="text-3xl font-bold mb-2 bg-linear-to-r from-cyan-100 to-cyan-300 bg-clip-text text-transparent">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-cyan-200 text-sm">{subtitle}</p>
            )}
          </div>
        )}

        {children}
      </div>
    </div>
  );
}
