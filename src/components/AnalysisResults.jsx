import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCcw, AlertTriangle, CheckCircle, Info, LayoutPanelTop } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import FindingCard from './FindingCard';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const AnalysisResults = ({ results, onReset }) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const { overallScore, summary, findings } = results;

  useEffect(() => {
    const duration = 2000;
    const start = 0;
    const end = overallScore;
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(start + (end - start) * ease));
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [overallScore]);

  const stats = findings.reduce((acc, f) => {
    acc[f.level]++;
    return acc;
  }, { high: 0, medium: 0, low: 0 });

  const scoreColor = overallScore >= 70 ? "text-emerald-400" : overallScore >= 40 ? "text-amber-400" : "text-rose-400";
  const scoreBg = overallScore >= 70 ? "stroke-emerald-400" : overallScore >= 40 ? "stroke-amber-400" : "stroke-rose-400";

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="md:col-span-1 glass-effect rounded-3xl p-8 flex flex-col items-center justify-center relative overflow-hidden"
        >
          <div className="relative w-40 h-40">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="80" cy="80" r="70" className="stroke-slate-800 fill-none" strokeWidth="8" />
              <motion.circle
                cx="80" cy="80" r="70" className={cn("fill-none", scoreBg)} strokeWidth="10"
                strokeDasharray={2 * Math.PI * 70}
                initial={{ strokeDashoffset: 2 * Math.PI * 70 }}
                animate={{ strokeDashoffset: (2 * Math.PI * 70) * (1 - overallScore / 100) }}
                transition={{ duration: 2, ease: "easeOut" }}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={cn("text-5xl font-black tracking-tighter", scoreColor)}>{animatedScore}</span>
              <span className="text-[10px] font-bold uppercase text-slate-500 tracking-widest mt-1">Risk Score</span>
            </div>
          </div>
          <div className="mt-8 text-center space-y-2">
            <h3 className="text-xl font-bold text-white tracking-tight">Overall Intelligence</h3>
            <p className="text-sm text-slate-400 font-medium leading-relaxed px-4 italic opacity-80">"{summary}"</p>
          </div>
        </motion.div>

        <div className="md:col-span-2 space-y-4">
           <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'High Risks', value: stats.high, color: 'text-rose-500', icon: AlertTriangle, bg: 'bg-rose-500/10 border-rose-500/20' },
                { label: 'Medium Risks', value: stats.medium, color: 'text-amber-500', icon: Info, bg: 'bg-amber-500/10 border-amber-500/20' },
                { label: 'Low Risks', value: stats.low, color: 'text-emerald-500', icon: CheckCircle, bg: 'bg-emerald-500/10 border-emerald-500/20' }
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + (i * 0.1) }}
                  className={cn("p-6 rounded-2xl border flex flex-col items-center justify-center glass-effect", stat.bg)}
                >
                  <stat.icon className={cn("w-6 h-6 mb-2", stat.color)} />
                  <span className="text-3xl font-black text-white">{stat.value}</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{stat.label}</span>
                </motion.div>
              ))}
           </div>
           <motion.div
             initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
             className="glass-effect rounded-2xl p-6 flex items-center justify-between border-primary/20"
           >
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-300">Detailed Risk Breakdown</span>
                <span className="text-xs text-slate-500">Categorized analysis for maximum visibility</span>
              </div>
              <button 
                onClick={onReset}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all border border-slate-700 active:scale-95"
              >
                <RefreshCcw className="w-3.5 h-3.5" /> Analyze New
              </button>
           </motion.div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-8">
           <div className="p-2 bg-primary/20 rounded-lg"><LayoutPanelTop className="w-5 h-5 text-primary" /></div>
           <div>
             <h2 className="text-lg font-bold text-white tracking-tight">Risk Vector Analysis</h2>
             <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">In-depth clause scrutiny</p>
           </div>
           <div className="flex-1 border-b border-white/5 ml-4" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {findings.map((finding, index) => (
            <FindingCard key={index} finding={finding} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalysisResults;
