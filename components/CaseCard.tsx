import React from 'react';
import { Case } from '../types';
import { ExternalLink, Calendar, MapPin, Tag, BookOpen, Star, Share2 } from 'lucide-react';

interface CaseCardProps {
  caseData: Case;
  onAnalyze: (caseData: Case) => void;
  isBookmarked: boolean;
  onToggleBookmark: (caseData: Case) => void;
}

export const CaseCard: React.FC<CaseCardProps> = ({ 
  caseData, 
  onAnalyze, 
  isBookmarked, 
  onToggleBookmark 
}) => {
  return (
    <div className="group relative bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm hover:shadow-xl hover:shadow-zinc-200/50 dark:hover:shadow-zinc-950/50 transition-all duration-300 flex flex-col gap-6 overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-emerald-600 dark:text-emerald-500">
            <MapPin className="w-3 h-3" />
            {caseData.jurisdiction}
          </div>
          <h3 className="text-xl font-serif font-bold text-zinc-900 dark:text-zinc-50 group-hover:text-emerald-600 transition-colors leading-tight">
            {caseData.name}
          </h3>
          <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {caseData.date}
            </span>
            <span className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              {caseData.citation}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <button 
            onClick={() => onToggleBookmark(caseData)}
            className={`p-2 rounded-lg transition-all active:scale-90 ${
              isBookmarked 
                ? 'bg-amber-50 text-amber-500 dark:bg-amber-900/20' 
                : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400'
            }`}
          >
            <Star className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
          <button className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition-all active:scale-90">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-3 font-medium">
        {caseData.summary}
      </p>

      <div className="flex flex-wrap gap-1.5">
        {caseData.tags.map((tag, idx) => (
          <span 
            key={idx} 
            className="px-2.5 py-1 bg-zinc-50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 rounded-md text-[10px] font-bold uppercase tracking-wider border border-zinc-100 dark:border-zinc-700"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="pt-4 mt-auto border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-4">
        <button
          onClick={() => onAnalyze(caseData)}
          className="flex-1 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 px-4 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-emerald-600 dark:hover:bg-emerald-500 hover:text-white transition-all shadow-lg shadow-zinc-900/10 active:scale-95"
        >
          <BookOpen className="w-4 h-4" />
          Deep Analysis
        </button>
        {caseData.fullTextUrl && (
          <a
            href={caseData.fullTextUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all active:scale-95"
            title="View Full Text"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>
    </div>
  );
};
