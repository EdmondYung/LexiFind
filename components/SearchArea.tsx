import React, { useState } from 'react';
import { Search, History, Trash2, ArrowRight, Sparkles, Scale } from 'lucide-react';

interface SearchAreaProps {
  onSearch: (query: string) => void;
  history: string[];
  onClearHistory: () => void;
}

export const SearchArea: React.FC<SearchAreaProps> = ({ onSearch, history, onClearHistory }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <div className="max-w-3xl mx-auto w-full px-6 py-12 flex flex-col items-center gap-12">
      <div className="text-center space-y-4">
        <h2 className="text-5xl font-serif font-bold tracking-tight text-zinc-900 dark:text-zinc-50 leading-tight">
          Global Case <span className="text-emerald-600 italic">Intelligence</span>
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400 text-lg max-w-xl mx-auto leading-relaxed">
          Search across jurisdictions with AI-powered grounding and deep legal analysis.
        </p>
      </div>

      <form 
        onSubmit={handleSubmit}
        className="w-full relative group"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
        <div className="relative flex items-center bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-2 overflow-hidden">
          <div className="pl-4 text-zinc-400">
            <Search className="w-6 h-6" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by case name, citation, or legal concept..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-lg px-4 py-3 text-zinc-900 dark:text-zinc-50 placeholder-zinc-400"
          />
          <button
            type="submit"
            disabled={!query.trim()}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:hover:bg-emerald-600 text-white px-8 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
          >
            Search
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </form>

      {history.length > 0 && (
        <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-sm font-medium">
              <History className="w-4 h-4" />
              Recent Searches
            </div>
            <button 
              onClick={onClearHistory}
              className="text-xs text-zinc-400 hover:text-red-500 transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              Clear
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {history.slice(0, 5).map((item, idx) => (
              <button
                key={idx}
                onClick={() => onSearch(item)}
                className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 rounded-full text-sm transition-all border border-zinc-200 dark:border-zinc-700 active:scale-95"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full pt-8">
        {[
          { title: 'Grounding', desc: 'Verified by Google Search', icon: Sparkles },
          { title: 'Analysis', desc: 'Deep legal reasoning', icon: Scale },
          { title: 'Chat', desc: 'Interactive Q&A session', icon: Search }
        ].map((feature, idx) => (
          <div key={idx} className="p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 space-y-3">
            <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center text-emerald-600">
              <feature.icon className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-zinc-900 dark:text-zinc-50">{feature.title}</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
