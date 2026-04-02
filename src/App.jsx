import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Search, Brain, AlertTriangle, CheckCircle, BarChart3, ChevronRight, LayoutPanelTop } from 'lucide-react';
import { analyzePolicy } from './api/gemini';
import InputSection from './components/InputSection';
import LoadingStatus from './components/LoadingStatus';
import AnalysisResults from './components/AnalysisResults';

const App = () => {
  const [policyText, setPolicyText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_GEMINI_API_KEY || '');

  // Step-by-step loading animation
  useEffect(() => {
    let timer;
    if (isAnalyzing && analysisStep < 4) {
      const delays = [800, 1500, 2500, 3500]; // Increasing delays for perceived depth
      timer = setTimeout(() => {
        setAnalysisStep(prev => prev + 1);
      }, delays[analysisStep]);
    }
    return () => clearTimeout(timer);
  }, [isAnalyzing, analysisStep]);

  const handleAnalyze = async () => {
    if (!policyText.trim()) return;
    
    setIsAnalyzing(true);
    setAnalysisStep(1);
    setResults(null);
    setError(null);

    try {
      const response = await analyzePolicy(policyText, apiKey);
      // Wait for at least some animation time to pass
      setTimeout(() => {
        setResults(response);
        setIsAnalyzing(false);
        setAnalysisStep(0);
      }, 1000); 
    } catch (err) {
      setError(err.message);
      setIsAnalyzing(false);
      setAnalysisStep(0);
    }
  };

  return (
    <div className="relative min-h-screen">
      <div className="bg-gradient" aria-hidden="true" />
      
      {/* Header */}
      <header className="container mx-auto px-6 py-12 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-4 bg-primary/10 px-4 py-2 rounded-full border border-primary/20"
        >
          <Shield className="w-6 h-6 text-primary" />
          <span className="font-semibold text-primary">AntiGravity Risk Scanner</span>
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 text-white"
        >
          Deep Privacy <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Intelligence</span>
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-slate-400 max-w-2xl text-lg"
        >
          Unravel complex legal terms in seconds. Our AI scrutinizes every sentence to protect your digital presence.
        </motion.p>
      </header>

      <main className="container mx-auto px-6 pb-24 max-w-5xl">
        <AnimatePresence mode="wait">
          {!results && !isAnalyzing && (
            <motion.div
              key="input"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.4 }}
            >
              <InputSection 
                policyText={policyText} 
                setPolicyText={setPolicyText} 
                onAnalyze={handleAnalyze} 
                isDisabled={!apiKey}
              />
              {!apiKey && (
                <p className="text-center text-rose-500 mt-4 text-sm bg-rose-500/10 px-4 py-2 rounded-lg border border-rose-500/20 max-w-xs mx-auto">
                  Missing VITE_GEMINI_API_KEY in .env
                </p>
              )}
            </motion.div>
          )}

          {isAnalyzing && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-12"
            >
              <LoadingStatus currentStep={analysisStep} />
            </motion.div>
          )}

          {results && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <AnalysisResults results={results} onReset={() => setResults(null)} />
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8 p-6 glass-effect bg-rose-500/10 border-rose-500/30 rounded-2xl text-center"
          >
            <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto mb-3" />
            <p className="text-rose-200">
              {error.includes('quota') ? 
                'API Quota Exceeded. Please wait a few minutes or switch to a paid Gemini plan.' : 
                `Analysis Failed: ${error}`}
            </p>
            <button 
              onClick={() => setError(null)}
              className="mt-4 text-sm text-slate-400 hover:text-white transition-colors underline"
            >
              Dismiss and try again
            </button>
          </motion.div>
        )}
      </main>

      <footer className="py-12 border-t border-border/10 text-center opacity-40">
        <p className="text-sm">Driven by Gemini 2.0 Flash Pro · Secured by AntiGravity Engine</p>
      </footer>
    </div>
  );
};

export default App;
