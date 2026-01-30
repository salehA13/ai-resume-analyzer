import { useState } from 'react';
import { analyzeResume, AnalysisResult } from './services/api';
import UploadZone from './components/UploadZone';
import AnalysisResults from './components/AnalysisResults';
import { FileSearch, Github } from 'lucide-react';

export default function App() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');

  const handleAnalyze = async (file: File, jobDesc: string, jobTitle: string) => {
    setLoading(true);
    setError('');
    try {
      const data = await analyzeResume(file, jobDesc, jobTitle);
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand-200/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-indigo-200/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-emerald-200/15 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="border-b border-white/60 bg-white/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/20">
              <FileSearch className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Resume Analyzer</h1>
              <p className="text-xs text-gray-500">AI-powered resume analysis</p>
            </div>
          </div>
          <a
            href="https://github.com/salehA13/ai-resume-analyzer"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition"
          >
            <Github className="w-5 h-5" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {!result ? (
          <div className="space-y-8">
            {/* Hero */}
            <div className="text-center max-w-2xl mx-auto space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-sm font-medium border border-brand-100">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
                AI-Powered Analysis
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
                Get your resume{' '}
                <span className="bg-gradient-to-r from-brand-600 to-indigo-600 bg-clip-text text-transparent">
                  analyzed in seconds
                </span>
              </h2>
              <p className="text-lg text-gray-500 max-w-lg mx-auto">
                Upload your PDF resume and get instant ATS scoring, skills analysis,
                and actionable improvement suggestions.
              </p>
            </div>

            <UploadZone onAnalyze={handleAnalyze} loading={loading} />

            {error && (
              <div className="max-w-2xl mx-auto p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto pt-8">
              {[
                { title: 'ATS Scoring', desc: 'Check how well your resume passes applicant tracking systems', icon: '🛡️' },
                { title: 'Skills Analysis', desc: 'See which skills match job requirements and what\'s missing', icon: '📊' },
                { title: 'Smart Suggestions', desc: 'Get AI-powered tips to improve your resume\'s impact', icon: '💡' },
              ].map((f) => (
                <div key={f.title} className="glass-card p-5 text-center">
                  <div className="text-2xl mb-2">{f.icon}</div>
                  <h3 className="font-semibold text-gray-900">{f.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <AnalysisResults result={result} onReset={handleReset} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200/60 bg-white/30 mt-20">
        <div className="max-w-6xl mx-auto px-6 py-6 text-center text-sm text-gray-400">
          Built with React, FastAPI & AI · Open source on{' '}
          <a href="https://github.com/salehA13/ai-resume-analyzer" className="text-brand-600 hover:underline">
            GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}
