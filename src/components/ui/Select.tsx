interface SelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}

export function Select({ label, value, onChange, options }: SelectProps) {
  return (
    <label className="block">
      <select 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="h-10 bg-[rgba(10,16,28,0.65)] border border-white/8 text-cyan-100 rounded-xl px-3 backdrop-blur-[6px]"
      >
        <option value="">{label}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
