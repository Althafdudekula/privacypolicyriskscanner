import React, { useState, useRef } from 'react';
import { Shield, Github } from 'lucide-react';
import { analyzePolicy } from './api/gemini';
import InputSection from './components/InputSection';
import LoadingStatus from './components/LoadingStatus';
import AnalysisResults from './components/AnalysisResults';

const App = () => {
  const [policyText, setPolicyText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const apiKey = import.meta.env.VITE_GROQ_API_KEY || '';
  const abortControllerRef = useRef(null);

  const handleAnalyze = async () => {
    if (!policyText.trim()) return;
    abortControllerRef.current = new AbortController();
    setIsAnalyzing(true);
    setResults(null);
    setError(null);

    try {
      const response = await analyzePolicy(
        policyText,
        apiKey,
        abortControllerRef.current.signal
      );
      setResults(response);
    } catch (err) {
      if (err.message !== 'Analysis cancelled.') {
        setError(err.message);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCancel = () => {
    abortControllerRef.current?.abort();
    setIsAnalyzing(false);
    setError(null);
  };

  const handleReset = () => {
    setResults(null);
    setError(null);
    setPolicyText('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between max-w-5xl">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900 tracking-tight text-base">
              Privacy Sentinel
            </span>
          </div>
          <span className="text-xs text-slate-400 font-medium hidden sm:block">
            Powered by Groq · LLaMA 3.3 70B
          </span>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-6 py-10 max-w-5xl w-full">
        {!results && !isAnalyzing && (
          <InputSection
            policyText={policyText}
            setPolicyText={setPolicyText}
            onAnalyze={handleAnalyze}
            isDisabled={!apiKey}
          />
        )}
        {isAnalyzing && <LoadingStatus onCancel={handleCancel} />}
        {results && <AnalysisResults results={results} onReset={handleReset} />}
        {error && (
          <div className="mt-6 p-5 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm flex items-start gap-3">
            <span className="text-lg">⚠</span>
            <div>
              <p className="font-semibold">Analysis failed</p>
              <p className="mt-1 text-red-500">{error}</p>
              <button
                onClick={handleReset}
                className="mt-3 text-xs font-semibold text-red-600 underline underline-offset-2"
              >
                Try again
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white py-4">
        <p className="text-center text-xs text-slate-400">
          Privacy Sentinel · Analysis happens client-side · Your data is never stored
        </p>
      </footer>
    </div>
  );
};

export default App;
