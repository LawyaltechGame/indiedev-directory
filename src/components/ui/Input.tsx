interface InputProps {
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  className?: string;
  label?: string;
  helperText?: string;
}

export function Input({
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  minLength,
  className = "",
  label,
  helperText,
}: InputProps) {
  const inputClasses = `w-full bg-[rgba(10,16,28,0.65)] border border-white/8 text-white rounded-xl p-3 font-inherit text-sm transition-all duration-200 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_0_2px_rgba(34,211,238,0.2)] ${className}`;

  return (
    <div>
      {label && (
        <label className="block text-sm font-semibold mb-2">
          {label} {required && '*'}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        className={inputClasses}
      />
      {helperText && (
        <p className="text-xs text-cyan-300/60 mt-1">{helperText}</p>
      )}
    </div>
  );
}
