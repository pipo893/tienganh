
import React, { useState, useCallback } from 'react';
import { checkGrammar } from '../services/geminiService';
import type { GrammarCorrection } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import Card from '../components/Card';
import { CheckCircleIcon } from '../components/icons';

const GrammarChecker: React.FC = () => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GrammarCorrection | null>(null);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      setError('Please enter some text to check.');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await checkGrammar(text);
      setResult(data);
    } catch (err) {
      setError('Failed to check grammar. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [text]);

  return (
    <div className="h-full flex flex-col gap-4">
      <Card>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste your text here..."
            className="w-full h-32 px-4 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow resize-none"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !text.trim()}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? <LoadingSpinner /> : 'Check Grammar'}
          </button>
        </form>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </Card>

      {result && (
        <Card className="flex-grow animate-fade-in">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">Corrected Text</h3>
              <p className="bg-green-50 dark:bg-green-900/50 text-green-800 dark:text-green-200 p-4 rounded-lg">{result.correctedText}</p>
            </div>
            
            {result.errors && result.errors.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">Explanations</h3>
                <ul className="space-y-3">
                  {result.errors.map((err, i) => (
                    <li key={i} className="p-3 bg-slate-100 dark:bg-slate-700/50 rounded-md">
                      <p className="font-semibold text-red-600 dark:text-red-400">{err.error}</p>
                      <p className="text-slate-600 dark:text-slate-400 mt-1">{err.explanation}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {result.errors && result.errors.length === 0 && (
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/50 rounded-lg">
                    <p className="font-semibold text-green-700 dark:text-green-300">Looks great! No errors found.</p>
                </div>
            )}

          </div>
        </Card>
      )}

      {!loading && !result && (
         <div className="flex-grow flex flex-col items-center justify-center text-center text-slate-500 dark:text-slate-400 p-8">
            <CheckCircleIcon className="w-24 h-24 text-slate-300 dark:text-slate-600 mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Grammar Checker</h2>
            <p className="max-w-md">Write with confidence. Our AI-powered grammar checker helps you correct mistakes and improve your writing style.</p>
        </div>
      )}
    </div>
  );
};

export default GrammarChecker;
