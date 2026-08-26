import React, { useState, useRef } from 'react';
import { extractTextFromFile, saveLocalResume, clearLocalResume } from '../../services/resumeMatcher';

interface ResumeMatcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentResume: { text: string; fileName: string; date: string } | null;
  onResumeUpdated: (resume: { text: string; fileName: string; date: string } | null) => void;
}

export function ResumeMatcherModal({
  isOpen,
  onClose,
  currentResume,
  onResumeUpdated,
}: ResumeMatcherModalProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [pastedText, setPastedText] = useState(currentResume?.text || '');
  const [resumeTitle, setResumeTitle] = useState(currentResume?.fileName || 'My Resume');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileProcess = async (file: File) => {
    setIsProcessing(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const text = await extractTextFromFile(file);
      if (!text || text.trim().length < 40) {
        throw new Error('Could not extract sufficient text from this file. Please paste your resume text directly.');
      }

      saveLocalResume(text, file.name);
      const newResume = {
        text,
        fileName: file.name,
        date: new Date().toLocaleDateString(),
      };
      onResumeUpdated(newResume);
      setSuccessMsg(`Successfully parsed ${file.name}! Matches are now active.`);
      setTimeout(() => {
        onClose();
      }, 900);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to parse file. Please try pasting the text instead.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleSavePastedText = () => {
    if (!pastedText.trim() || pastedText.trim().length < 30) {
      setErrorMsg('Please paste at least a few sentences of your resume or experience.');
      return;
    }
    const name = resumeTitle.trim() || 'Pasted Resume';
    saveLocalResume(pastedText, name);
    const newResume = {
      text: pastedText,
      fileName: name,
      date: new Date().toLocaleDateString(),
    };
    onResumeUpdated(newResume);
    setSuccessMsg('Resume saved locally! Match scores are now active.');
    setTimeout(() => {
      onClose();
    }, 700);
  };

  const handleClear = () => {
    clearLocalResume();
    setPastedText('');
    onResumeUpdated(null);
    setSuccessMsg('Resume removed from browser storage.');
  };

  const wordCount = pastedText.trim() ? pastedText.trim().split(/\s+/).length : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-2xl bg-[#07101b] border border-white/12 rounded-2xl shadow-2xl shadow-cyan-950/40 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/8 flex items-center justify-between bg-linear-to-r from-[#071826] to-[#07101b]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-xl">
              🎯
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Resume Matcher
              </h2>
              <p className="text-xs text-cyan-200/70 mt-0.5">
                Calculate instant match scores against real studio job openings
              </p>
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Active status if resume is already loaded */}
          {currentResume && (
            <div className="p-4 rounded-xl bg-[#091522] border border-cyan-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📄</span>
                <div>
                  <div className="text-sm font-semibold text-white truncate max-w-xs sm:max-w-md">
                    {currentResume.fileName}
                  </div>
                  <div className="text-xs text-cyan-300/60">
                    Saved locally on {currentResume.date} • Match scores active
                  </div>
                </div>
              </div>
              <button
                onClick={handleClear}
                className="text-xs px-3 py-1.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20 transition-all font-medium"
              >
                Clear Resume
              </button>
            </div>
          )}

          {/* Tab Selector */}
          <div className="flex border-b border-white/8">
            <button
              onClick={() => setActiveTab('upload')}
              className={`pb-2.5 px-4 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === 'upload'
                  ? 'border-cyan-400 text-cyan-300'
                  : 'border-transparent text-cyan-300/50 hover:text-cyan-200'
              }`}
            >
              📁 Upload File (.pdf, .docx, .txt)
            </button>
            <button
              onClick={() => setActiveTab('paste')}
              className={`pb-2.5 px-4 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === 'paste'
                  ? 'border-cyan-400 text-cyan-300'
                  : 'border-transparent text-cyan-300/50 hover:text-cyan-200'
              }`}
            >
              ✍️ Paste Text
            </button>
          </div>

          {/* Upload Tab */}
          {activeTab === 'upload' && (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
                isDragging
                  ? 'border-cyan-400 bg-cyan-500/10 scale-[0.99]'
                  : 'border-white/12 bg-[#071826]/40 hover:border-cyan-500/40 hover:bg-cyan-500/5'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt,.rtf,.md"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="text-4xl mb-3">📄</div>
              <h3 className="text-base font-bold text-white mb-1">
                {isProcessing ? 'Processing resume locally...' : 'Drop your resume here, or click to browse'}
              </h3>
              <p className="text-xs text-cyan-200/60 max-w-sm mx-auto mb-4">
                Supports PDF, DOCX, TXT, Markdown. Text is extracted directly on your machine.
              </p>
              <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 text-xs font-semibold">
                Select File
              </div>
            </div>
          )}

          {/* Paste Tab */}
          {activeTab === 'paste' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-cyan-200/70 mb-1">
                  Resume Title / Role Name
                </label>
                <input
                  type="text"
                  value={resumeTitle}
                  onChange={(e) => setResumeTitle(e.target.value)}
                  placeholder="e.g. Senior Gameplay Programmer - Resume"
                  className="w-full bg-[rgba(9,14,22,0.7)] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-sm focus:border-cyan-400 outline-none transition-colors"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-cyan-200/70">
                    Paste Resume Content
                  </label>
                  <span className="text-xs text-cyan-300/50">{wordCount} words</span>
                </div>
                <textarea
                  rows={8}
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Paste your experience, skills, game projects, technologies, and achievements here..."
                  className="w-full bg-[rgba(9,14,22,0.7)] border border-white/10 rounded-xl p-3.5 text-white text-xs font-mono focus:border-cyan-400 outline-none resize-y transition-colors leading-relaxed"
                />
              </div>
              <button
                onClick={handleSavePastedText}
                className="w-full py-3 rounded-xl bg-linear-to-b from-cyan-500 to-cyan-400 text-[#001018] font-bold text-sm hover:shadow-lg hover:shadow-cyan-500/30 transition-all cursor-pointer"
              >
                Save & Compute Match Scores 🎯
              </button>
            </div>
          )}

          {/* Feedback Messages */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <span>⚠️</span> {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <span>✅</span> {successMsg}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/8 bg-[#040810] flex items-center justify-between">
          <span className="text-xs text-cyan-300/40">
            Powered by client-side heuristic ATS engine
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/6 hover:bg-white/10 text-cyan-200 text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

