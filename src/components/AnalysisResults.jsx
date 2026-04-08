import React, { useEffect, useState, useRef } from 'react';
import {
  Shield,
  AlertTriangle,
  AlertCircle,
  Info,
  Database,
  Share2,
  Clock,
  UserCheck,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  CheckCircle,
} from 'lucide-react';

// ── Animated score counter ──────────────────────────────────────────────────
function useCountUp(target, duration = 1400) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = null;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return value;
}

// ── Score ring ──────────────────────────────────────────────────────────────
function ScoreRing({ score }) {
  const animated = useCountUp(score);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const [dashOffset, setDashOffset] = useState(circumference);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDashOffset(circumference * (1 - score / 100));
    }, 100);
    return () => clearTimeout(timeout);
  }, [score, circumference]);

  const color =
    score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';
  const label =
    score >= 80 ? 'Low Risk' : score >= 50 ? 'Medium Risk' : score >= 20 ? 'High Risk' : 'Critical Risk';

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
          <circle cx="64" cy="64" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="10" />
          <circle
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.16,1,0.3,1)' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-black text-slate-900 leading-none">{animated}</span>
          <span className="text-xs font-medium text-slate-400 mt-1">/100</span>
        </div>
      </div>
      <span
        className="text-sm font-semibold px-3 py-1 rounded-full"
        style={{ background: `${color}20`, color }}
      >
        {label}
      </span>
    </div>
  );
}

// ── Animated progress bar ───────────────────────────────────────────────────
function AnimatedBar({ value, color }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(value), 150);
    return () => clearTimeout(t);
  }, [value]);

  return (
    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full"
        style={{
          width: `${width}%`,
          backgroundColor: color,
          transition: 'width 1.2s cubic-bezier(0.16,1,0.3,1)',
        }}
      />
    </div>
  );
}

// ── Category card ───────────────────────────────────────────────────────────
const CATEGORY_META = {
  data_collection: { label: 'Data Collection', Icon: Database },
  data_sharing: { label: 'Data Sharing', Icon: Share2 },
  data_retention: { label: 'Data Retention', Icon: Clock },
  user_control: { label: 'User Control', Icon: UserCheck },
};

function CategoryCard({ categoryKey, value }) {
  const meta = CATEGORY_META[categoryKey] || { label: categoryKey, Icon: Info };
  const { label, Icon } = meta;
  const color = value >= 80 ? '#10b981' : value >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className="card-professional p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            {label}
          </span>
        </div>
        <span className="text-sm font-bold" style={{ color }}>
          {value}
        </span>
      </div>
      <AnimatedBar value={value} color={color} />
    </div>
  );
}

// ── Risk badge ──────────────────────────────────────────────────────────────
const RISK_CONFIG = {
  High: { color: '#ef4444', bg: '#fef2f2', Icon: AlertTriangle },
  Medium: { color: '#f59e0b', bg: '#fffbeb', Icon: AlertCircle },
  Low: { color: '#3b82f6', bg: '#eff6ff', Icon: Info },
};

function RiskCard({ risk, index }) {
  const [open, setOpen] = useState(false);
  const cfg = RISK_CONFIG[risk.level] || RISK_CONFIG.Low;
  const { Icon } = cfg;

  return (
    <div
      className="card-professional overflow-hidden"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-start gap-4 p-5 text-left hover:bg-slate-50 transition-colors"
      >
        <span
          className="mt-0.5 flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
          style={{ background: cfg.bg }}
        >
          <Icon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full uppercase"
              style={{ background: cfg.bg, color: cfg.color }}
            >
              {risk.level}
            </span>
          </div>
          <p className="text-sm text-slate-700 font-medium leading-snug line-clamp-2">
            {risk.text}
          </p>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" />
        )}
      </button>

      {open && (
        <div className="border-t border-slate-100 px-5 pb-5 pt-4 space-y-3">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
              Why it's risky
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">{risk.reason}</p>
          </div>
          {risk.rewrite && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-1">
                ✦ Safer rewrite
              </p>
              <p className="text-sm text-emerald-800 leading-relaxed">{risk.rewrite}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────
const AnalysisResults = ({ results, onReset }) => {
  const score = Number(results?.score) || 0;
  const categories = results?.categories || {};
  const risks = results?.risks || [];
  const summary = results?.summary || '';

  const highCount = risks.filter((r) => r.level === 'High').length;
  const medCount = risks.filter((r) => r.level === 'Medium').length;
  const lowCount = risks.filter((r) => r.level === 'Low').length;

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Analysis Complete</h1>
          <p className="text-slate-500 text-sm mt-1">Privacy policy risk assessment report</p>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          New Scan
        </button>
      </div>

      {/* Score + Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card-professional p-8 flex flex-col items-center justify-center gap-2">
          <ScoreRing score={score} />
          <p className="text-xs text-slate-400 mt-2 font-medium text-center">
            Risk Safety Score
          </p>
        </div>
        <div className="lg:col-span-2 card-professional p-8 flex flex-col gap-4">
          <h2 className="text-base font-bold text-slate-900">Professional Summary</h2>
          <p className="text-slate-600 leading-relaxed text-sm">{summary}</p>
          <div className="flex flex-wrap gap-3 mt-auto pt-2">
            {highCount > 0 && (
              <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-red-50 text-red-600">
                <AlertTriangle className="w-3 h-3" />
                {highCount} High Risk
              </span>
            )}
            {medCount > 0 && (
              <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-50 text-amber-600">
                <AlertCircle className="w-3 h-3" />
                {medCount} Medium Risk
              </span>
            )}
            {lowCount > 0 && (
              <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-50 text-blue-600">
                <Info className="w-3 h-3" />
                {lowCount} Low Risk
              </span>
            )}
            {risks.length === 0 && (
              <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600">
                <CheckCircle className="w-3 h-3" />
                No major risks found
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      {Object.keys(categories).length > 0 && (
        <div>
          <h2 className="text-base font-bold text-slate-900 mb-4">Category Breakdown</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(categories).map(([key, val]) => (
              <CategoryCard key={key} categoryKey={key} value={Number(val) || 0} />
            ))}
          </div>
        </div>
      )}

      {/* Detailed Findings */}
      {risks.length > 0 && (
        <div>
          <h2 className="text-base font-bold text-slate-900 mb-4">
            Detailed Findings
            <span className="ml-2 text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              {risks.length} issues
            </span>
          </h2>
          <div className="space-y-3">
            {risks.map((risk, i) => (
              <RiskCard key={i} risk={risk} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisResults;
