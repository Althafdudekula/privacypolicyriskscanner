import React from 'react';
import { Search } from 'lucide-react';

const InputSection = ({ policyText, setPolicyText, onAnalyze, isDisabled }) => {
  return (
    <div className="space-y-6">
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
