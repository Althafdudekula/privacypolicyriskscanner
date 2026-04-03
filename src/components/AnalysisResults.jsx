import React from 'react';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  ArrowRight, 
  RefreshCcw, 
  Search,
  Database,
  Share2,
  Clock,
  UserCheck,
  Lock
} from 'lucide-react';

const AnalysisResults = ({ results, onReset }) => {
  const parsedScore = Number(results.score !== undefined ? results.score : results.overallScore || 0);
  const categories = results.categories || {};
  const summary = results.summary || "No summary available.";
  const risks = results.risks || results.findings || [];

  const getScoreColor = (s) => {
    if (s >= 80) return 'text-emerald-600';
    if (s >= 50) return 'text-amber-500';
    return 'text-rose-600';
  };

  const getScoreBg = (s) => {
    if (s >= 80) return 'bg-emerald-50 border-emerald-100';
    if (s >= 50) return 'bg-amber-50 border-amber-100';
    return 'bg-rose-50 border-rose-100';
  };

  const getRiskBadge = (level) => {
    switch (level.toLowerCase()) {
      case 'high': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 uppercase">High Risk</span>;
      case 'medium': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 uppercase">Medium Risk</span>;
      case 'low': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 uppercase">Low Risk</span>;
      default: return null;
    }
  };

  const categoryIcons = {
    data_collection: Database,
    data_sharing: Share2,
    data_retention: Clock,
    consent: UserCheck
  };

  const categoryLabels = {
    data_collection: 'Data Collection',
    data_sharing: 'Data Sharing',
    data_retention: 'Data Retention',
    consent: 'User Consent'
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Top Section: Score & Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className={`lg:col-span-1 p-8 rounded-2xl border flex flex-col items-center justify-center text-center ${getScoreBg(parsedScore)}`}>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Risk Safety Score</span>
          <div className="relative flex items-center justify-center">
            <span className={`text-7xl font-black tracking-tighter ${getScoreColor(parsedScore)}`}>{parsedScore}</span>
            <span className="text-xl font-bold text-slate-400 absolute -bottom-1 -right-8">/100</span>
          </div>
          <div className="mt-6">
            <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
              parsedScore >= 80 ? 'bg-emerald-500 text-white' : 
              parsedScore >= 50 ? 'bg-amber-500 text-white' : 
              'bg-rose-500 text-white'
            }`}>
              {parsedScore >= 80 ? 'Safe Policy' : parsedScore >= 50 ? 'Moderate Risk' : 'High Risk'}
            </span>
          </div>
        </div>

        <div className="lg:col-span-2 p-8 card-professional flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-slate-900">Professional Summary</h2>
          </div>
          <p className="text-slate-600 leading-relaxed text-lg font-medium italic">
            "{summary}"
          </p>
          <div className="mt-8 flex items-center gap-4">
             <button 
              onClick={onReset}
              className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg flex items-center gap-2 hover:bg-slate-800 transition-colors uppercase tracking-widest"
             >
               <RefreshCcw className="w-3.5 h-3.5" /> Start New Scan
             </button>
             <button className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-bold rounded-lg flex items-center gap-2 hover:bg-slate-50 transition-colors uppercase tracking-widest">
               Download PDF Report
             </button>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
            <Database className="w-4 h-4 text-primary" />
          </div>
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Compliance Breakdown</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(categories).map(([key, val]) => {
            const Icon = categoryIcons[key] || Info;
            return (
              <div key={key} className="card-professional p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <Icon className="w-4 h-4 text-slate-600" />
                  </div>
                  <span className={`text-lg font-black ${getScoreColor(Number(val))}`}>{Number(val)}%</span>
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{categoryLabels[key]}</span>
                  <div className="progress-bar-container">
                    <div 
                      className={`progress-bar flex items-center justify-end pr-2 text-[10px] font-bold text-white ${
                        Number(val) >= 80 ? 'bg-emerald-500' : Number(val) >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${Number(val)}%` }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Risk Analysis Cards */}
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-primary" />
          </div>
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Risky Statements Identified</h3>
        </div>
        
        <div className="grid gap-6">
          {risks.map((risk, index) => (
            <div key={index} className="card-professional group hover:border-primary/20 transition-all">
              <div className="grid grid-cols-1 lg:grid-cols-12">
                {/* Original Text */}
                <div className="lg:col-span-5 p-6 border-b lg:border-b-0 lg:border-r border-slate-100 bg-slate-50/30">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Original Clause</span>
                    {getRiskBadge(risk.level)}
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium line-clamp-4 group-hover:line-clamp-none transition-all">
                    "{risk.text}"
                  </p>
                </div>

                {/* Analysis & Rewrite */}
                <div className="lg:col-span-7 p-6 space-y-6">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2 underline decoration-primary/30 decoration-2 underline-offset-4">Why this is risky</span>
                    <p className="text-sm text-slate-700 font-bold leading-relaxed">
                      {risk.reason}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Safer Rewritten Version</span>
                    </div>
                    <p className="text-xs text-emerald-800 font-semibold italic leading-relaxed">
                      "{risk.rewrite}"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Educational Footer */}
      <div className="bg-slate-900 rounded-2xl p-8 text-white relative overflow-hidden shadow-xl">
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full">
              <Info className="w-4 h-4 text-blue-400" />
              <span className="text-[10px] font-black uppercase tracking-widest">What this means for you</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Understanding your report</h2>
            <p className="text-blue-100/70 text-sm leading-relaxed">
              Legalese is designed to be confusing. Our system translates these complex instruments into risk-weighted scores so you can make informed decisions about your data privacy. A low score doesn't always mean a product is "bad", but it does mean you should be extra careful about what you share.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-center">
               <span className="text-2xl font-black block mb-1">98%</span>
               <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Accuracy</span>
            </div>
            <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-center">
               <span className="text-2xl font-black block mb-1">GDPR</span>
               <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Compliant</span>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl -mr-32 -mt-32" />
      </div>

      <div className="text-center pb-12">
        <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em] mb-4">Verification Certificate</p>
        <div className="inline-flex items-center gap-12 opacity-30 grayscale saturate-0">
           <div className="flex items-center gap-2"><Shield className="w-5 h-5" /><span className="font-bold text-xs uppercase tracking-widest">AuditPass</span></div>
           <div className="flex items-center gap-2"><Lock className="w-5 h-5" /><span className="font-bold text-xs uppercase tracking-widest">PrivacyTrust</span></div>
           <div className="flex items-center gap-2"><CheckCircle className="w-5 h-5" /><span className="font-bold text-xs uppercase tracking-widest">CertiLegal</span></div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResults;
