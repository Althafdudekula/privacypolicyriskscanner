import React from 'react';
import { Search, Shield, AlertCircle } from 'lucide-react';

const MAX_CHARS = 12000;

const InputSection = ({ policyText, setPolicyText, onAnalyze, isDisabled }) => {
  const charCount = policyText.length;
  const percentage = Math.min((charCount / MAX_CHARS) * 100, 100);
  const isOverLimit = charCount > MAX_CHARS;
  const isEmpty = policyText.trim().length === 0;

  const barColor = isOverLimit
    ? '#ef4444'
    : percentage > 80
    ? '#f59e0b'
    : '#2563eb';

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="text-center space-y-4 py-8">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-50 rounded-2xl">
          <Shield className="w-7 h-7 text-blue-600" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Privacy Policy Risk Scanner
          </h1>
          <p className="text-slate-500 mt-2 max-w-md mx-auto text-sm leading-relaxed">
            Paste any privacy policy below. Our AI will analyze the text and provide an
            instant risk assessment with actionable insights.
          </p>
        </div>
      </div>

      {/* Input card */}
      <div className="card-professional p-1">
        <textarea
          className="input-field min-h-[320px] resize-none font-mono text-sm"
          placeholder="Paste a privacy policy here...&#10;&#10;Example: 'We may share your personal data with third-party partners for advertising purposes...'"
          value={policyText}
          onChange={(e) => setPolicyText(e.target.value)}
        />

        {/* Footer bar */}
        <div className="px-4 pb-3 pt-2 flex items-center justify-between gap-4">
          <div className="flex-1 space-y-1.5">
            <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${percentage}%`, backgroundColor: barColor }}
              />
            </div>
            <div className="flex items-center gap-1.5">
              {isOverLimit && (
                <AlertCircle className="w-3 h-3 text-amber-500 flex-shrink-0" />
              )}
              <span
                className="text-xs font-medium"
                style={{ color: isOverLimit ? '#f59e0b' : '#94a3b8' }}
              >
                {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()} characters
                {isOverLimit && ' — text will be trimmed for analysis'}
              </span>
            </div>
          </div>

          <button
            onClick={onAnalyze}
            disabled={isDisabled || isEmpty}
            className="btn-primary flex items-center gap-2 px-6 py-2.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Search className="w-4 h-4" />
            Analyze Policy
          </button>
        </div>
      </div>

      {isDisabled && (
        <p className="text-center text-xs text-red-500">
          ⚠ No API key found. Make sure{' '}
          <code className="bg-red-50 px-1 rounded">VITE_GROQ_API_KEY</code> is set in your{' '}
          <code className="bg-red-50 px-1 rounded">.env</code> file.
        </p>
      )}

      {/* Feature hints */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: '🔍', title: 'Instant Analysis', desc: 'Results in seconds using Groq LLaMA 3.3' },
          { icon: '📊', title: 'Risk Scoring', desc: 'Clear 0–100 safety score with category breakdown' },
          { icon: '✏️', title: 'Safer Rewrites', desc: 'AI suggests privacy-respecting alternatives' },
        ].map((f) => (
          <div key={f.title} className="card-professional p-5 text-center">
            <div className="text-2xl mb-2">{f.icon}</div>
            <p className="text-sm font-semibold text-slate-700">{f.title}</p>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InputSection;
