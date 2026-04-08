import React, { useState, useRef } from 'react';
import { Shield, AlertCircle, CheckCircle, Info, Lock } from 'lucide-react';
import { analyzePolicy } from './api/groq';
import InputSection from './components/InputSection';
import LoadingStatus from './components/LoadingStatus';
import AnalysisResults from './components/AnalysisResults';

const App = () => {
  const [policyText, setPolicyText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [apiKey] = useState(import.meta.env.VITE_GROQ_API_KEY || '');
  const abortControllerRef = useRef(null);

  const handleAnalyze = async () => {
    if (!policyText.trim()) return;

    // Create a fresh AbortController for this analysis
    abortControllerRef.current = new AbortController();
    setIsAnalyzing(true);
    setResults(null);
    setError(null);

    try {
      const response = await analyzePolicy(policyText, apiKey, abortControllerRef.current.signal);
      setResults(response);
      setIsAnalyzing(false);
    } catch (err) {
      setIsAnalyzing(false);
      if (err.message !== 'Analysis cancelled.') {
        setError(err.message);
      }
    }
  };

  const handleCancel = () => {
    abortControllerRef.current?.abort();
    setIsAnalyzing(false);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-institutional" aria-hidden="true" />
      
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-slate-900 tracking-tight text-lg">Privacy Policy Risk Scanner</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#" className="hover:text-primary transition-colors">Home</a>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-6 py-12 max-w-5xl">
        {!results && !isAnalyzing && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center max-w-2xl mx-auto space-y-4">
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                Analyze Privacy Policies for <span className="text-primary">Compliance Risks</span>
              </h1>
              <p className="text-lg text-slate-500">
                Paste any privacy policy text below to generate a detailed risk assessment and professional compliance report.
              </p>
            </div>
            
            <InputSection 
              policyText={policyText} 
              setPolicyText={setPolicyText} 
              onAnalyze={handleAnalyze} 
              isDisabled={!apiKey}
            />
            
            {!apiKey && (
              <div className="max-w-md mx-auto p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-3 items-center">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <p className="text-sm text-amber-700 font-medium">
                  <strong>API Key Required:</strong> Please configure <code>VITE_GROQ_API_KEY</code> in your .env file to enable analysis.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
              {[
                { icon: Lock, title: 'Secure Analysis', desc: 'Data is processed securely and never stored on our servers.' },
                { icon: Info, title: 'Plain English', desc: 'Complex legal jargon is translated into easy-to-understand risks.' },
                { icon: CheckCircle, title: 'Actionable Rewrites', desc: 'Get safer alternatives for detected high-risk clauses.' }
              ].map((item, i) => (
                <div key={i} className="card-professional p-6 space-y-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-bold text-slate-900">{item.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {isAnalyzing && (
          <div className="py-12">
            <LoadingStatus onCancel={handleCancel} />
          </div>
        )}

        {results && (
          <div className="animate-in fade-in duration-700">
            <AnalysisResults results={results} onReset={() => setResults(null)} />
          </div>
        )}

        {error && (
          <div className="mt-8 p-6 bg-red-50 border border-red-100 rounded-xl text-center max-w-2xl mx-auto">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900 mb-1">Analysis Failed</h3>
            <p className="text-sm text-slate-600 mb-4">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="px-6 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-border py-8">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 opacity-50">
            <Shield className="w-4 h-4" />
            <span className="font-bold text-xs uppercase tracking-tight">Privacy Policy Risk Scanner</span>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            &copy; {new Date().getFullYear()} Professional Privacy Audit Tool. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs font-semibold text-slate-400">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-primary transition-colors">Legal Disclaimer</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;

