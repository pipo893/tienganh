
import React, { useState, useCallback } from 'react';
import { getStory } from '../services/geminiService';
import LoadingSpinner from '../components/LoadingSpinner';
import Card from '../components/Card';
import { PencilSquareIcon } from '../components/icons';

type Level = 'Beginner' | 'Intermediate' | 'Advanced';

const StoryGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [level, setLevel] = useState<Level>('Intermediate');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [story, setStory] = useState<string | null>(null);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setError('Please enter a story prompt.');
      return;
    }
    setLoading(true);
    setError(null);
    setStory(null);
    try {
      const generatedStory = await getStory(prompt, level);
      setStory(generatedStory);
    } catch (err) {
      setError('Failed to generate story. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [prompt, level]);

  return (
    <div className="h-full flex flex-col gap-4">
      <Card>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A lost puppy in a big city..."
              className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? <LoadingSpinner /> : 'Generate Story'}
            </button>
          </div>
          <div className="flex items-center justify-center gap-4">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Difficulty:</span>
            {(['Beginner', 'Intermediate', 'Advanced'] as Level[]).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLevel(l)}
                className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${
                  level === l ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </form>
        {error && <p className="text-red-500 mt-2 text-center">{error}</p>}
      </Card>
      
      {story && (
        <Card className="flex-grow animate-fade-in">
          <div className="prose prose-slate dark:prose-invert max-w-none">
            {story.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </Card>
      )}

      {!loading && !story && (
         <div className="flex-grow flex flex-col items-center justify-center text-center text-slate-500 dark:text-slate-400 p-8">
            <PencilSquareIcon className="w-24 h-24 text-slate-300 dark:text-slate-600 mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Story Generator</h2>
            <p className="max-w-md">Unleash your imagination. Provide a prompt and choose a difficulty level to generate a unique story, perfect for reading practice.</p>
        </div>
      )}
    </div>
  );
};

export default StoryGenerator;
