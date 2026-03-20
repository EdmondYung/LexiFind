import React from 'react';
import { Scale, Moon, Sun, Search, History, BookMarked } from 'lucide-react';

interface HeaderProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
  onShowHistory: () => void;
  onShowBookmarks: () => void;
  onNewSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  darkMode, 
  toggleDarkMode, 
  onShowHistory, 
  onShowBookmarks,
  onNewSearch
}) => {
  return (
    <header className="sticky top-0 z-50 glass border-b border-zinc-200 dark:border-zinc-800 px-6 py-4 flex items-center justify-between">
      <div 
        className="flex items-center gap-3 cursor-pointer group"
        onClick={onNewSearch}
      >
        <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-600/20 group-hover:scale-105 transition-transform">
          <Scale className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-serif font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            LexiFind
          </h1>
          <p className="text-[10px] uppercase tracking-[0.2em] font-medium text-zinc-500 dark:text-zinc-400">
            Intelligent Legal Research
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button 
          onClick={onShowHistory}
          className="p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors"
          title="Search History"
        >
          <History className="w-5 h-5" />
        </button>
        <button 
          onClick={onShowBookmarks}
          className="p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors"
          title="Bookmarks"
        >
          <BookMarked className="w-5 h-5" />
        </button>
        <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 mx-1" />
        <button 
          onClick={toggleDarkMode}
          className="p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors"
          title={darkMode ? "Light Mode" : "Dark Mode"}
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>
    </header>
  );
};
