import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const InputSection = ({ policyText, setPolicyText, onAnalyze, isDisabled }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="relative group">
        <div 
          className={cn(
            "absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-3xl blur opacity-20 transition duration-1000 group-hover:opacity-40",
            isFocused && "opacity-60"
          )}
        />
        
        <div className="glass-effect rounded-3xl p-6 relative flex flex-col gap-4">
          <textarea
            value={policyText}
            onChange={(e) => setPolicyText(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Paste a privacy policy or terms of service text here...&#10;&#10;Try: 'This policy governs how we collect, use and sell your data to third parties without consent.'"
            className="w-full min-h-[300px] bg-transparent border-none focus:ring-0 text-slate-100 placeholder:text-slate-600 resize-none font-medium leading-relaxed"
          />

          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span>Gemini 2.0 Pro Inference</span>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onAnalyze}
              disabled={isDisabled || !policyText.trim()}
              className={cn(
                "relative group overflow-hidden px-8 py-3 rounded-2xl flex items-center gap-2 font-bold transition-all",
                "bg-primary text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]",
                "hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <Search className="w-5 h-5" />
              <span>Initialize Analysis</span>
            </motion.button>
          </div>
        </div>
      </div>
      
      <div className="flex justify-center gap-8 text-slate-600 text-xs font-semibold tracking-wider uppercase">
        <div className="flex items-center gap-1.5 opacity-60">
          <span>GDPR Ready</span>
        </div>
        <div className="flex items-center gap-1.5 opacity-60">
          <span>CCPA Compliant</span>
        </div>
        <div className="flex items-center gap-1.5 opacity-60">
          <span>End-to-End Encryption</span>
        </div>
      </div>
    </div>
  );
};

export default InputSection;
