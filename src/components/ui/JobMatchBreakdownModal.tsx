import { useState } from 'react';
import type { JobListing } from '../../services/jobs';
import type { ResumeMatchResult } from '../../services/resumeMatcher';

interface JobMatchBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: JobListing | null;
  matchResult: ResumeMatchResult | null;
  resumeFileName: string;
  onEditResume: () => void;
}

export function JobMatchBreakdownModal({
  isOpen,
  onClose,
  job,
  matchResult,
  resumeFileName,
  onEditResume,
}: JobMatchBreakdownModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'improvements'>('improvements');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  if (!isOpen || !job || !matchResult) return null;

  const handleCopyBullet = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1800);
  };

  const handleCopyFullPlan = () => {
    const lines = [
      `# Resume Improvement Plan for ${job.title} at ${job.company}`,
      `Current Fit Score: ${matchResult.score}% | Potential Fit Score: ${matchResult.potentialScore}%\n`,
      `## 1. Suggested Resume Headline`,
      `${matchResult.improvementPlan.headlineSuggestion}\n`,
      `## 2. High-Impact Missing Keywords to Add:`,
      ...matchResult.highImpactKeywords.map(k => `- ${k.keyword} (${k.category}): ${k.tip}`),
      `\n## 3. Sample Bullet Points to Include in Experience:`,
      ...matchResult.improvementPlan.experienceBulletExamples.map(b => `- "${b}"`),
      `\n## 4. Key Action Items:`,
      ...matchResult.improvementPlan.keyActionItems.map(a => `- [ ] ${a}`),
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-3xl bg-[#07101b] border border-white/12 rounded-2xl shadow-2xl shadow-cyan-950/50 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-white/8 bg-linear-to-r from-[#071826] via-[#092237] to-[#07101b] flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-cyan-950/80 border border-cyan-400/40 flex flex-col items-center justify-center shrink-0 shadow-inner">
              <span className="text-2xl font-extrabold text-white">{matchResult.score}%</span>
              <span className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider">Current</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-cyan-300 font-bold">{job.company}</span>
                <span className="text-xs text-white/30">•</span>
                <span className={`text-xs px-2.5 py-0.5 rounded-md font-semibold border ${matchResult.ratingColor}`}>
                  {matchResult.rating}
                </span>
                {matchResult.score < 90 && (
                  <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold flex items-center gap-1">
                    <span>🚀</span> Target: {matchResult.potentialScore}%+
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white mt-1 leading-snug">
                {job.title}
              </h2>
              <div className="text-xs text-cyan-200/60 mt-1 flex items-center gap-3">
                <span>📍 {job.location}</span>
                {job.remote && <span className="text-cyan-300 font-medium">🌐 Remote</span>}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/6 hover:bg-white/12 flex items-center justify-center text-cyan-200/80 hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex px-6 pt-3 border-b border-white/8 bg-[#060c16]">
          <button
            onClick={() => setActiveTab('improvements')}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'improvements'
                ? 'border-cyan-400 text-cyan-200'
                : 'border-transparent text-cyan-300/50 hover:text-cyan-200'
            }`}
          >
            <span>💡</span>
            <span>How to Improve Your Score</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-extrabold">
              Recommended
            </span>
          </button>
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'border-cyan-400 text-cyan-200'
                : 'border-transparent text-cyan-300/50 hover:text-cyan-200'
            }`}
          >
            <span>📊</span>
            <span>Match Overview & Skills</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* Active resume bar */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/4 border border-white/8 text-xs">
            <div className="flex items-center gap-2 text-cyan-200/80 truncate">
              <span>📄</span>
              <span className="font-semibold text-white truncate max-w-xs">{resumeFileName}</span>
            </div>
            <button
              onClick={() => {
                onClose();
                onEditResume();
              }}
              className="text-xs text-cyan-300 hover:text-white transition-colors underline font-medium shrink-0 ml-2 cursor-pointer"
            >
              Change Resume
            </button>
          </div>

          {/* ════════════════════ TAB: HOW TO IMPROVE ════════════════════ */}
          {activeTab === 'improvements' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Score Improvement Banner */}
              <div className="p-4 rounded-xl bg-linear-to-r from-[#072438] via-[#092d47] to-[#072438] border border-cyan-400/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-center sm:text-left">
                  <div className="text-3xl">📈</div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Score Increase Potential: {matchResult.score}% → <span className="text-emerald-300 font-extrabold">{matchResult.potentialScore}%</span>
                    </h3>
                    <p className="text-xs text-cyan-200/75 mt-0.5">
                      Adding the suggested keywords below to your resume directly targets {job.company}'s ATS requirements.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCopyFullPlan}
                  className="px-3.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-200 text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
                >
                  <span>{copiedAll ? '✅' : '📋'}</span>
                  <span>{copiedAll ? 'Copied to Clipboard!' : 'Copy Tailoring Summary'}</span>
                </button>
              </div>

              {/* 1. Missing High-Impact Keywords */}
              {matchResult.highImpactKeywords.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-cyan-200 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <span>1️⃣</span> Keywords to Add for Higher Score ({matchResult.highImpactKeywords.length})
                  </h3>
                  <div className="grid gap-3 grid-cols-1">
                    {matchResult.highImpactKeywords.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-[#091522] border border-white/8 hover:border-cyan-500/30 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs font-bold">
                              + {item.keyword}
                            </span>
                            <span className="text-[11px] text-cyan-300/50">({item.category})</span>
                          </div>
                          <span className="text-[11px] text-emerald-400 font-semibold">
                            High ATS Impact
                          </span>
                        </div>
                        <p className="text-xs text-cyan-100/80 mb-2">{item.tip}</p>
                        {item.exampleBullet && (
                          <div className="p-2.5 rounded-lg bg-black/40 border border-white/6 flex items-center justify-between gap-2 text-xs font-mono text-cyan-200/90">
                            <span className="truncate italic">"{item.exampleBullet}"</span>
                            <button
                              onClick={() => handleCopyBullet(item.exampleBullet, idx + 100)}
                              className="text-[10px] px-2 py-1 rounded bg-white/8 hover:bg-white/15 text-cyan-300 hover:text-white transition-colors shrink-0 cursor-pointer font-sans font-semibold"
                            >
                              {copiedIndex === idx + 100 ? '✓ Copied' : 'Copy Bullet'}
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. Recommended Headline */}
              <div>
                <h3 className="text-xs font-bold text-cyan-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span>2️⃣</span> Recommended Resume Headline / Sub-title
                </h3>
                <div className="p-3.5 rounded-xl bg-[#091522] border border-white/8 flex items-center justify-between gap-3">
                  <span className="text-xs font-mono text-cyan-200">
                    "{matchResult.improvementPlan.headlineSuggestion}"
                  </span>
                  <button
                    onClick={() => handleCopyBullet(matchResult.improvementPlan.headlineSuggestion, 999)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-white/8 hover:bg-white/15 text-cyan-300 hover:text-white transition-colors shrink-0 cursor-pointer font-semibold"
                  >
                    {copiedIndex === 999 ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* 3. Sample Bullet Points */}
              {matchResult.improvementPlan.experienceBulletExamples.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-cyan-200 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <span>3️⃣</span> Sample Accomplishment Bullets to Adapt
                  </h3>
                  <div className="space-y-2">
                    {matchResult.improvementPlan.experienceBulletExamples.map((bullet, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-[#091522] border border-white/8 flex items-start justify-between gap-3 text-xs"
                      >
                        <span className="text-cyan-100/90 leading-relaxed font-mono text-[11px] sm:text-xs">
                          • {bullet}
                        </span>
                        <button
                          onClick={() => handleCopyBullet(bullet, idx)}
                          className="text-[11px] px-2 py-1 rounded-md bg-white/8 hover:bg-white/15 text-cyan-300 hover:text-white transition-colors shrink-0 cursor-pointer font-sans font-semibold"
                        >
                          {copiedIndex === idx ? '✓ Copied' : 'Copy'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. Action Items Checklist */}
              <div>
                <h3 className="text-xs font-bold text-cyan-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span>4️⃣</span> Resume Checklist Before Applying
                </h3>
                <div className="p-4 rounded-xl bg-[#091522] border border-cyan-500/30 space-y-2">
                  {matchResult.improvementPlan.keyActionItems.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-cyan-100/90">
                      <span className="text-cyan-400 font-bold mt-0.5">✓</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════ TAB: OVERVIEW & SKILLS ════════════════════ */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Matched Skills */}
              <div>
                <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span>✅</span> Matched Skills in Resume ({matchResult.matchedKeywords.length})
                </h3>
                {matchResult.matchedKeywords.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {matchResult.matchedKeywords.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold"
                      >
                        ✓ {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-cyan-200/50 italic">
                    No direct keywords matched. Check the "How to Improve" tab for suggestions.
                  </p>
                )}
              </div>

              {/* Missing Skills */}
              {matchResult.missingKeywords.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span>⚠️</span> Missing or Unmentioned Skills ({matchResult.missingKeywords.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {matchResult.missingKeywords.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs font-semibold"
                      >
                        + {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Category Breakdown Progress */}
              {matchResult.categoryBreakdown.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-cyan-200 uppercase tracking-wider mb-3">
                    Category Breakdown
                  </h3>
                  <div className="space-y-3">
                    {matchResult.categoryBreakdown.map((cat) => (
                      <div key={cat.category} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-white">{cat.category}</span>
                          <span className="text-cyan-300">{cat.score}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              cat.score >= 75
                                ? 'bg-emerald-400'
                                : cat.score >= 50
                                ? 'bg-cyan-400'
                                : 'bg-amber-400'
                            }`}
                            style={{ width: `${cat.score}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/8 bg-[#040810] flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-white/6 hover:bg-white/10 text-cyan-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            Back to Jobs
          </button>
          <a
            href={job.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-linear-to-b from-cyan-500 to-cyan-400 text-[#001018] font-bold text-sm hover:shadow-lg hover:shadow-cyan-500/40 transition-all active:scale-[0.97]"
          >
            Apply on {job.company} Website →
          </a>
        </div>
      </div>
    </div>
  );
}
