import React from 'react';

interface CaseSkeletonProps {
  viewMode: 'grid' | 'list';
}

export const CaseSkeleton: React.FC<CaseSkeletonProps> = ({ viewMode }) => {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm flex flex-col gap-6 animate-pulse">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3 flex-1">
          <div className="h-3 w-24 bg-zinc-100 dark:bg-zinc-800 rounded-md" />
          <div className="h-7 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
          <div className="flex items-center gap-4">
            <div className="h-4 w-20 bg-zinc-100 dark:bg-zinc-800 rounded-md" />
            <div className="h-4 w-32 bg-zinc-100 dark:bg-zinc-800 rounded-md" />
          </div>
        </div>
        <div className="flex gap-1">
          <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-xl" />
          <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-xl" />
        </div>
      </div>

      <div className="space-y-2">
        <div className="h-4 w-full bg-zinc-100 dark:bg-zinc-800 rounded-md" />
        <div className="h-4 w-5/6 bg-zinc-100 dark:bg-zinc-800 rounded-md" />
        <div className="h-4 w-4/6 bg-zinc-100 dark:bg-zinc-800 rounded-md" />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-6 w-16 bg-zinc-50 dark:bg-zinc-800 rounded-md border border-zinc-100 dark:border-zinc-700" />
        ))}
      </div>

      <div className="pt-4 mt-auto border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-4">
        <div className="h-10 flex-1 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
        <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-xl" />
      </div>
    </div>
  );
};
