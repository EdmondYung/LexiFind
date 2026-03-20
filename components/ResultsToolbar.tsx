import React from 'react';
import { SortOption } from '../types';
import { Filter, SortAsc, SortDesc, ListFilter, LayoutGrid, LayoutList } from 'lucide-react';

interface ResultsToolbarProps {
  totalResults: number;
  sortOption: SortOption;
  onSortChange: (option: SortOption) => void;
  jurisdictions: string[];
  selectedJurisdiction: string;
  onJurisdictionChange: (jurisdiction: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

export const ResultsToolbar: React.FC<ResultsToolbarProps> = ({
  totalResults,
  sortOption,
  onSortChange,
  jurisdictions,
  selectedJurisdiction,
  onJurisdictionChange,
  viewMode,
  onViewModeChange
}) => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-6 py-8 animate-in fade-in duration-700">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-400">
          <ListFilter className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-serif font-bold text-zinc-900 dark:text-zinc-50">
            {totalResults} <span className="text-zinc-400 font-normal italic">Matches Found</span>
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium tracking-wide uppercase">
            Global Jurisdiction Search
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Jurisdiction Filter */}
        <div className="relative group">
          <select
            value={selectedJurisdiction}
            onChange={(e) => onJurisdictionChange(e.target.value)}
            className="appearance-none bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 pr-10 text-sm font-bold text-zinc-700 dark:text-zinc-300 hover:border-emerald-500 transition-all cursor-pointer shadow-sm"
          >
            <option value="All">All Jurisdictions</option>
            {jurisdictions.map(j => (
              <option key={j} value={j}>{j}</option>
            ))}
          </select>
          <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
        </div>

        {/* Sort */}
        <div className="relative group">
          <select
            value={sortOption}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="appearance-none bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 pr-10 text-sm font-bold text-zinc-700 dark:text-zinc-300 hover:border-emerald-500 transition-all cursor-pointer shadow-sm"
          >
            <option value="relevance">Relevance</option>
            <option value="date_desc">Newest First</option>
            <option value="date_asc">Oldest First</option>
          </select>
          {sortOption === 'date_asc' ? (
            <SortAsc className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
          ) : (
            <SortDesc className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
          )}
        </div>

        <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 mx-1" />

        {/* View Mode Toggle */}
        <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-inner">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`p-2 rounded-lg transition-all ${
              viewMode === 'grid' 
                ? 'bg-white dark:bg-zinc-700 text-emerald-600 shadow-sm' 
                : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`p-2 rounded-lg transition-all ${
              viewMode === 'list' 
                ? 'bg-white dark:bg-zinc-700 text-emerald-600 shadow-sm' 
                : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'
            }`}
          >
            <LayoutList className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
