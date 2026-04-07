import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, Search, LayoutPanelTop, FileText, XCircle } from 'lucide-react';

const steps = [
  { id: 1, label: 'Scanning policy text', icon: FileText },
  { id: 2, label: 'Identifying privacy risks', icon: Search },
  { id: 3, label: 'Calculating risk ratings', icon: LayoutPanelTop },
  { id: 4, label: 'Generating compliance report', icon: CheckCircle2 }
];

const LoadingStatus = ({ onCancel }) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length ? prev + 1 : prev));
    }, 1200);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="max-w-md mx-auto py-12 px-6 card-professional">
      <div className="flex flex-col gap-8">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <div 
              key={step.id} 
              className={`flex items-center gap-4 transition-all duration-500 ${isCompleted || isCurrent ? 'opacity-100' : 'opacity-30'}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                isCompleted ? 'bg-primary border-primary text-white' : 
                isCurrent ? 'border-primary text-primary bg-blue-50' : 
                'border-slate-200'
              }`}>
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 animate-in zoom-in duration-300" />
                ) : isCurrent ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <step.icon className="w-5 h-5" />
                )}
              </div>
              <div className="flex flex-col">
                <span className={`text-sm font-bold tracking-tight ${isCurrent ? 'text-primary' : 'text-slate-900'}`}>
                  {step.label}
                </span>
                {isCurrent && (
                  <span className="text-[10px] uppercase font-black text-primary/60 tracking-widest animate-pulse">
                    Processing...
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-12 pt-8 border-t border-slate-100 space-y-4">
        <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
           <span>Institutional Privacy Scrutiny</span>
           <span>v4.0.1</span>
        </div>
        <div className="progress-bar-container">
          <div 
            className="progress-bar bg-primary" 
            style={{ width: `${Math.min((currentStep / steps.length) * 100, 100)}%` }}
          />
        </div>
        {onCancel && (
          <div className="flex justify-center pt-2">
            <button
              onClick={onCancel}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-500 border border-slate-200 rounded-lg hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all uppercase tracking-widest"
            >
              <XCircle className="w-4 h-4" />
              Cancel Analysis
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingStatus;
