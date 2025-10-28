import { useState } from 'react';

interface PasswordInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  className?: string;
  label?: string;
  helperText?: string;
}

export function PasswordInput({
  value,
  onChange,
  placeholder = "••••••••",
  required = false,
  minLength,
  className = "",
  label,
  helperText,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const inputClasses = `w-full bg-[rgba(10,16,28,0.65)] border border-white/8 text-white rounded-xl p-3 pr-12 font-inherit text-sm transition-all duration-200 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_0_2px_rgba(34,211,238,0.2)] ${className}`;

  return (
    <div>
      {label && (
        <label className="block text-sm font-semibold mb-2">
          {label} {required && '*'}
        </label>
      )}
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          minLength={minLength}
          className={inputClasses}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-300 hover:text-cyan-100 transition-colors duration-200"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </button>
      </div>
      {helperText && (
        <p className="text-xs text-cyan-300/60 mt-1">{helperText}</p>
      )}
    </div>
  );
}
