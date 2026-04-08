import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

const steps = [
  { id: 1, label: 'Scanning policy text', sublabel: 'Parsing document structure...' },
  { id: 2, label: 'Identifying privacy risks', sublabel: 'Detecting data collection clauses...' },
  { id: 3, label: 'Calculating risk ratings', sublabel: 'Scoring severity levels...' },
  { id: 4, label: 'Generating compliance report', sublabel: 'Compiling findings...' },
];

const LoadingStatus = ({ onCancel }) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="max-w-sm mx-auto py-16 px-6 flex flex-col items-center gap-8">
      {/* Spinner */}
      <div className="relative w-16 h-16 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 animate-spin" />
        <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-white" />
        </div>
      </div>

      {/* Steps */}
      <div className="w-full card-professional p-6 space-y-4">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-5">
          Analysis in progress
        </p>
        {steps.map((step, i) => {
          const done = i < currentStep;
          const active = i === currentStep;
          return (
            <div
              key={step.id}
              className="flex items-start gap-3 transition-opacity duration-500"
              style={{ opacity: done || active ? 1 : 0.3 }}
            >
              <div className="mt-0.5 flex-shrink-0">
                {done ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ) : active ? (
                  <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-slate-200" />
                )}
              </div>
              <div>
                <p
                  className={`text-sm font-medium ${
                    active ? 'text-slate-900' : done ? 'text-slate-500' : 'text-slate-300'
                  }`}
                >
                  {step.label}
                </p>
                {active && (
                  <p className="text-xs text-slate-400 mt-0.5">{step.sublabel}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={onCancel}
        className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-600 transition-colors"
      >
        <XCircle className="w-4 h-4" />
        Cancel analysis
      </button>
    </div>
  );
};

export default LoadingStatus;
