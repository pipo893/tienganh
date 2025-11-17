
import React, { useState, useCallback } from 'react';
import VocabularyBuilder from './features/VocabularyBuilder';
import GrammarChecker from './features/GrammarChecker';
import ConversationPractice from './features/ConversationPractice';
import StoryGenerator from './features/StoryGenerator';
import { BookOpenIcon, CheckCircleIcon, ChatBubbleLeftRightIcon, PencilSquareIcon, SparklesIcon } from './components/icons';

type Feature = 'vocabulary' | 'grammar' | 'conversation' | 'story';

const App: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState<Feature>('vocabulary');

  const renderFeature = useCallback(() => {
    switch (activeFeature) {
      case 'vocabulary':
        return <VocabularyBuilder />;
      case 'grammar':
        return <GrammarChecker />;
      case 'conversation':
        return <ConversationPractice />;
      case 'story':
        return <StoryGenerator />;
      default:
        return <VocabularyBuilder />;
    }
  }, [activeFeature]);

  const TabButton = ({ feature, label, icon }: { feature: Feature, label: string, icon: React.ReactNode }) => (
    <button
      onClick={() => setActiveFeature(feature)}
      className={`flex items-center justify-center sm:justify-start gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
        activeFeature === feature
          ? 'bg-blue-600 text-white'
          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-800 dark:text-slate-200">
      <header className="sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700 z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <SparklesIcon className="w-8 h-8 text-blue-500" />
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100">
              Lingo Buddy
            </h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 flex-grow flex flex-col md:flex-row gap-6 lg:gap-8 py-6">
        <aside className="md:w-1/5 lg:w-1/6">
          <nav className="flex flex-row md:flex-col gap-2 p-2 md:p-0 bg-slate-100 dark:bg-slate-800 rounded-lg md:bg-transparent md:dark:bg-transparent">
            <TabButton feature="vocabulary" label="Vocabulary" icon={<BookOpenIcon className="w-5 h-5" />} />
            <TabButton feature="grammar" label="Grammar" icon={<CheckCircleIcon className="w-5 h-5" />} />
            <TabButton feature="conversation" label="Practice" icon={<ChatBubbleLeftRightIcon className="w-5 h-5" />} />
            <TabButton feature="story" label="Stories" icon={<PencilSquareIcon className="w-5 h-5" />} />
          </nav>
        </aside>

        <main className="flex-grow md:w-4/5 lg:w-5/6">
          {renderFeature()}
        </main>
      </div>

       <footer className="text-center py-4 border-t border-slate-200 dark:border-slate-700">
        <p className="text-sm text-slate-500 dark:text-slate-400">Powered by Gemini API</p>
      </footer>
    </div>
  );
};

export default App;
