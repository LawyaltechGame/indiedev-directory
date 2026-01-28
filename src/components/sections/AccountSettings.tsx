import { useNavigate } from 'react-router-dom';

export function AccountSettings() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-bg text-white flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center bg-[rgba(20,28,42,0.9)] border border-white/8 rounded-2xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <h1 className="text-2xl font-bold mb-3 bg-linear-to-r from-cyan-100 to-cyan-300 bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-cyan-200 mb-6 text-sm">Settings page is coming soon.</p>
        <button
          onClick={() => navigate(-1)}
          className="h-11 px-5 bg-linear-to-b from-cyan-500 to-cyan-300 text-[#001018] rounded-xl font-extrabold border-0 cursor-pointer transition-all duration-200 hover:from-cyan-400 hover:to-cyan-500 shadow-[0_8px_22px_rgba(34,211,238,0.35)]"
        >
          Back
        </button>
      </div>
    </div>
  );
}

