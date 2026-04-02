import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, Info, ArrowRightLeft, Brain } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const FindingCard = ({ finding, index }) => {
  const [showSafer, setShowSafer] = useState(false);
  const [displayText, setDisplayText] = useState('');
  
  const severityColors = {
    high: "border-rose-500/50 bg-rose-500/5 text-rose-500",
    medium: "border-amber-500/50 bg-amber-500/5 text-amber-500",
    low: "border-emerald-500/50 bg-emerald-500/5 text-emerald-500"
  };

  const severityGlow = {
    high: "shadow-[0_0_15px_rgba(244,63,94,0.15)]",
    medium: "shadow-[0_0_15px_rgba(245,158,11,0.15)]",
    low: "shadow-[0_0_15px_rgba(16,185,129,0.15)]"
  };

  useEffect(() => {
    let charIndex = 0;
    const interval = setInterval(() => {
      if (charIndex < finding.explanation.length) {
        setDisplayText(prev => prev + finding.explanation[charIndex]);
        charIndex++;
      } else {
        clearInterval(interval);
      }
    }, 15);
    return () => clearInterval(interval);
  }, [finding.explanation]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        delay: 0.2 + (index * 0.15), 
        duration: 0.5,
        type: "spring",
        stiffness: 100 
      }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={cn(
        "glass-effect rounded-2xl p-6 relative group overflow-hidden border-l-4",
        severityColors[finding.level],
        severityGlow[finding.level],
        finding.level === 'high' && "animate-[pulse_4s_infinite]"
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className={cn(
             "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
             severityColors[finding.level],
             "bg-white/10"
          )}>
            {finding.level} risk
          </span>
          <span className="text-sm font-bold text-slate-300 tracking-tight">
            {finding.category}
          </span>
        </div>
        
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
          <Info className="w-3.5 h-3.5" />
          <span>Detailed Insight</span>
        </div>
      </div>

      <div className="relative mb-6">
        <AnimatePresence mode="wait">
          {!showSafer ? (
            <motion.div
              key="original"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="p-4 bg-slate-900/40 rounded-xl border border-white/5"
            >
              <p className="text-sm text-slate-400 italic">" {finding.quote} "</p>
            </motion.div>
          ) : (
            <motion.div
              key="safer"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20"
            >
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-emerald-400 uppercase">Recommended Improvement</span>
              </div>
              <p className="text-sm text-emerald-100 font-medium">{finding.safer_version}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <button 
          onClick={() => setShowSafer(!showSafer)}
          className="absolute -bottom-3 right-4 p-2 bg-primary rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all text-white border border-white/20"
        >
          <ArrowRightLeft className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 italic">
          <Brain className="w-3.5 h-3.5 text-primary" /> 
           Analysis Verdict
        </h4>
        <p className="text-sm text-slate-200 leading-relaxed font-medium min-h-[40px]">
          {displayText}
          {displayText.length < finding.explanation.length && (
            <span className="w-1.5 h-4 bg-primary inline-block ml-1 animate-pulse align-middle" />
          )}
        </p>
      </div>
    </motion.div>
  );
};

export default FindingCard;
