import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Brain, AlertTriangle, BarChart3, Loader2, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const LoadingStatus = ({ currentStep }) => {
  const steps = [
    { id: 1, label: "Scanning policy structure...", icon: Search, color: "text-blue-400" },
    { id: 2, label: "Understanding context & clauses...", icon: Brain, color: "text-purple-400" },
    { id: 3, label: "Detecting hidden risks...", icon: AlertTriangle, color: "text-rose-400" },
    { id: 4, label: "Finalizing risk score...", icon: BarChart3, color: "text-emerald-400" }
  ];

  return (
    <div className="max-w-md mx-auto space-y-4">
      {steps.map((step) => {
        const isActive = currentStep === step.id;
        const isCompleted = currentStep > step.id;
        
        return (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ 
              opacity: isActive || isCompleted ? 1 : 0.4, 
              x: 0,
              scale: isActive ? 1.05 : 1
            }}
            className={cn(
              "flex items-center gap-4 p-4 rounded-2xl transition-all duration-500",
              isActive && "glass-effect bg-white/5 border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)]",
              !isActive && !isCompleted && "grayscale opacity-40"
            )}
          >
            <div className={cn(
              "p-2.5 rounded-xl bg-slate-900/50 border border-border/50",
              isActive && "neon-glow ring-1 ring-white/20"
            )}>
              {isCompleted ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : isActive ? (
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              ) : (
                <step.icon className={cn("w-5 h-5", step.color)} />
              )}
            </div>
            
            <div className="flex-1">
              <span className={cn(
                "text-sm font-semibold tracking-wide",
                isActive ? "text-white" : "text-slate-500"
              )}>
                {step.label}
              </span>
              {isActive && (
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="h-0.5 w-full bg-gradient-to-r from-primary to-transparent mt-2 origin-left"
                />
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default LoadingStatus;
