import { useEffect, useRef, useState } from 'react';

type MenuItem = {
  id: string;
  label: string;
  onClick: () => void;
  tone?: 'default' | 'danger';
};

interface AccountMenuProps {
  displayName?: string;
  items: MenuItem[];
}

export function AccountMenu({ displayName, items }: AccountMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!ref.current) return;
      if (ref.current.contains(e.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const initials = String(displayName || 'Account')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join('') || 'A';

  return (
    <div ref={ref} className="relative hidden md:block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-10 h-10 rounded-xl bg-[rgba(9,14,22,0.55)] border border-white/10 text-cyan-100 font-extrabold hover:bg-[rgba(0,229,255,0.12)] hover:text-white hover:shadow-[0_0_10px_rgba(0,229,255,0.35)] transition-all"
        aria-label="Account menu"
        title="Account"
      >
        {initials}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-[rgba(20,28,42,0.95)] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.55)] overflow-hidden z-[80]">
          <div className="px-4 py-3 border-b border-white/10">
            <div className="text-xs text-cyan-300/80">Signed in</div>
            <div className="text-sm font-bold text-white truncate">{displayName || 'Account'}</div>
          </div>
          <div className="py-1">
            {items.map((it) => (
              <button
                key={it.id}
                type="button"
                onClick={() => {
                  setOpen(false);
                  it.onClick();
                }}
                className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition ${
                  it.tone === 'danger'
                    ? 'text-red-300 hover:bg-red-500/10'
                    : 'text-cyan-100 hover:bg-[rgba(0,229,255,0.08)]'
                }`}
              >
                {it.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

