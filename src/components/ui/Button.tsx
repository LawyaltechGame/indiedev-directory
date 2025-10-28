import { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  fullWidth?: boolean;
}

export function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  fullWidth = false,
}: ButtonProps) {
  const baseClasses = 'font-extrabold rounded-xl border-0 cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-linear-to-b from-cyan-500 to-cyan-300 text-[#001018] hover:from-cyan-400 hover:to-cyan-500 shadow-[0_8px_22px_rgba(34,211,238,0.35)] hover:shadow-[0_12px_28px_rgba(34,211,238,0.45)]',
    secondary: 'bg-[rgba(9,14,22,0.55)] text-cyan-100 hover:bg-[rgba(0,229,255,0.12)] hover:text-white hover:shadow-[0_0_10px_rgba(0,229,255,0.35)]',
    outline: 'border border-white/8 bg-[rgba(9,14,22,0.55)] text-cyan-100 hover:bg-[rgba(0,229,255,0.12)] hover:text-white hover:shadow-[0_0_10px_rgba(0,229,255,0.35)]'
  };
  
  const sizeClasses = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base'
  };

  const classes = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `.trim();

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={classes}
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Loading...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
}
