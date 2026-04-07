import React from 'react';
import { Search, AlertTriangle, CheckCircle } from 'lucide-react';

const MAX_CHARS = 12000;

const InputSection = ({ policyText, setPolicyText, onAnalyze, isDisabled }) => {
  const charCount = policyText.length;
  const isOverLimit = charCount > MAX_CHARS;
  const isNearLimit = charCount > MAX_CHARS * 0.85 && !isOverLimit;
  const percentage = Math.min((charCount / MAX_CHARS) * 100, 100);

  return (
    <div className="space-y-4">
      <div className="relative group">
        <textarea
          className="input-field min-h-[400px] text-slate-700 leading-relaxed font-medium placeholder:text-slate-400"
          placeholder="Paste a privacy policy here (e.g., 'We collect your personal data to...')"
          value={policyText}
          onChange={(e) => setPolicyText(e.target.value)}
        />
        <div className="absolute top-4 right-4 text-slate-300 pointer-events-none group-focus-within:text-primary/40 transition-colors">
          <Search className="w-6 h-6" />
        </div>
      </div>

      {/* Character counter bar */}
      {charCount > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className={isOverLimit ? 'text-amber-600' : isNearLimit ? 'text-amber-500' : 'text-slate-400'}>
              {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()} characters
            </span>
            {isOverLimit ? (
              <span className="flex items-center gap-1 text-amber-600">
                <AlertTriangle className="w-3.5 h-3.5" />
                Text will be auto-trimmed to fit
              </span>
            ) : isNearLimit ? (
              <span className="flex items-center gap-1 text-amber-500">
                <AlertTriangle className="w-3.5 h-3.5" />
                Approaching limit
              </span>
            ) : (
              <span className="flex items-center gap-1 text-emerald-500">
                <CheckCircle className="w-3.5 h-3.5" />
                Good length
              </span>
            )}
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isOverLimit ? 'bg-amber-400' : isNearLimit ? 'bg-amber-400' : 'bg-emerald-400'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex justify-center">
        <button
          onClick={onAnalyze}
          disabled={isDisabled || !policyText.trim()}
          className="btn-primary w-full md:w-auto min-w-[200px] flex items-center justify-center gap-2 py-4 h-14 transition-all"
        >
          <span className="font-bold">Analyze Policy</span>
          <div className="w-px h-4 bg-white/20 mx-1" />
          <Search className="w-4 h-4 opacity-70" />
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-bold text-slate-400 uppercase tracking-widest pt-2">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
          <span>Professional Grade</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
          <span>Compliance Check</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
          <span>Legal-Tech AI</span>
        </div>
      </div>
    </div>
  );
};

export default InputSection;
