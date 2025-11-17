
import React, { useState, useCallback, useRef } from 'react';
import { getWordInfo, getPronunciation } from '../services/geminiService';
import type { VocabularyInfo } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import Card from '../components/Card';
import { BookOpenIcon, SpeakerWaveIcon } from '../components/icons';

// --- Audio Utility Functions ---
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
// --------------------------------

const VocabularyBuilder: React.FC = () => {
  const [word, setWord] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VocabularyInfo | null>(null);
  const [audioData, setAudioData] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!word.trim()) {
      setError('Please enter a word.');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    setAudioData(null);
    try {
      const [info, audio] = await Promise.all([
        getWordInfo(word),
        getPronunciation(word)
      ]);
      setResult(info);
      setAudioData(audio);
    } catch (err) {
      setError('Failed to fetch word information or pronunciation. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [word]);

  const handlePlayAudio = useCallback(async () => {
    if (!audioData) return;
    
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const audioContext = audioContextRef.current;
      
      const decodedBytes = decode(audioData);
      const audioBuffer = await decodeAudioData(decodedBytes, audioContext, 24000, 1);
      
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start();
    } catch (err) {
        console.error("Failed to play audio:", err);
        setError("Could not play the audio pronunciation.");
    }
  }, [audioData]);

  return (
    <div className="h-full flex flex-col gap-4">
      <Card>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            placeholder="Enter an English word..."
            className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !word.trim()}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? <LoadingSpinner /> : 'Define'}
          </button>
        </form>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </Card>
      
      {result && (
        <Card className="flex-grow animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-3xl font-bold capitalize text-blue-600 dark:text-blue-400">{result.word}</h2>
            {audioData && (
              <button 
                onClick={handlePlayAudio}
                className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                aria-label="Play pronunciation"
              >
                <SpeakerWaveIcon className="w-6 h-6 text-blue-500" />
              </button>
            )}
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">Definition</h3>
              <p className="text-slate-600 dark:text-slate-400">{result.definition}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">Example Sentences</h3>
              <ul className="list-disc list-inside space-y-2 pl-2 text-slate-600 dark:text-slate-400">
                {result.examples.map((ex, i) => <li key={i}>{ex}</li>)}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">Synonyms</h3>
              <div className="flex flex-wrap gap-2">
                {result.synonyms.map((syn, i) => (
                  <span key={i} className="bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm font-medium px-3 py-1 rounded-full">
                    {syn}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {!loading && !result && (
         <div className="flex-grow flex flex-col items-center justify-center text-center text-slate-500 dark:text-slate-400 p-8">
            <BookOpenIcon className="w-24 h-24 text-slate-300 dark:text-slate-600 mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Vocabulary Builder</h2>
            <p className="max-w-md">Enter a word to discover its definition, see it in context, and explore related words. Expand your English vocabulary with ease.</p>
        </div>
      )}
    </div>
  );
};

export default VocabularyBuilder;
