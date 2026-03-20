import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { SearchArea } from './components/SearchArea';
import { AnalysisModal } from './components/AnalysisModal';
import { CaseCard } from './components/CaseCard';
import { CaseSkeleton } from './components/CaseSkeleton';
import { ResultsToolbar } from './components/ResultsToolbar';
import { searchCases, analyzeLegalConcept } from './services/gemini';
import { SearchStatus, GroundingChunk, CaseAnalysis, Case, SortOption } from './types';
import { 
  ExternalLink, 
  AlertTriangle, 
  BookOpen, 
  ArrowLeft, 
  Search, 
  Scale, 
  ShieldCheck, 
  Loader2,
  ChevronRight,
  Sparkles
} from 'lucide-react';

const App: React.FC = () => {
  const [status, setStatus] = useState<SearchStatus>(SearchStatus.IDLE);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  
  // Data State
  const [cases, setCases] = useState<Case[]>([]);
  const [groundingSources, setGroundingSources] = useState<GroundingChunk[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>(() => JSON.parse(localStorage.getItem('searchHistory') || '[]'));
  const [bookmarks, setBookmarks] = useState<Case[]>(() => JSON.parse(localStorage.getItem('bookmarks') || '[]'));

  // Filter & Sort State
  const [sortOption, setSortOption] = useState<SortOption>('relevance');
  const [selectedJurisdiction, setSelectedJurisdiction] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Analysis State
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [analysis, setAnalysis] = useState<CaseAnalysis | null>(null);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('searchHistory', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    
    setStatus(SearchStatus.SEARCHING);
    setErrorMsg(null);
    setCases([]);
    setGroundingSources([]);
    
    // Update history
    setHistory(prev => [query, ...prev.filter(h => h !== query)].slice(0, 10));

    try {
      const result = await searchCases(query);
      setCases(result.cases);
      setGroundingSources(result.groundingChunks);
      setStatus(SearchStatus.SUCCESS);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Unable to complete search. Please check your connection or try again.");
      setStatus(SearchStatus.ERROR);
    }
  };

  const handleAnalyze = async (caseData: Case) => {
    setSelectedCase(caseData);
    setIsAnalysisModalOpen(true);
    setIsAnalysisLoading(true);
    setAnalysis(null);
    setAnalysisError(null);

    try {
      const context = `Case: ${caseData.name}\nSummary: ${caseData.summary}\nCitation: ${caseData.citation}\nJurisdiction: ${caseData.jurisdiction}`;
      const result = await analyzeLegalConcept(context);
      setAnalysis(result);
    } catch (err: any) {
      console.error(err);
      setAnalysisError(err.message || "Failed to analyze the case. Please try again.");
    } finally {
      setIsAnalysisLoading(false);
    }
  };

  const toggleBookmark = (caseData: Case) => {
    setBookmarks(prev => {
      const isBookmarked = prev.some(b => b.citation === caseData.citation);
      if (isBookmarked) {
        return prev.filter(b => b.citation !== caseData.citation);
      }
      return [caseData, ...prev];
    });
  };

  const jurisdictions = useMemo(() => {
    const unique = new Set(cases.map(c => c.jurisdiction));
    return Array.from(unique).sort();
  }, [cases]);

  const filteredAndSortedCases = useMemo(() => {
    let result = [...cases];
    
    if (selectedJurisdiction !== 'All') {
      result = result.filter(c => c.jurisdiction === selectedJurisdiction);
    }

    result.sort((a, b) => {
      if (sortOption === 'date_desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortOption === 'date_asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
      return 0; // relevance is default from API
    });

    return result;
  }, [cases, selectedJurisdiction, sortOption]);

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-500">
      <Header 
        darkMode={darkMode} 
        toggleDarkMode={() => setDarkMode(!darkMode)}
        onShowHistory={() => {}} // Could implement a sidebar
        onShowBookmarks={() => setCases(bookmarks)}
        onNewSearch={() => setStatus(SearchStatus.IDLE)}
      />

      <main className="flex-1 flex flex-col">
        {status === SearchStatus.IDLE ? (
          <div className="flex-1 flex items-center justify-center">
            <SearchArea 
              onSearch={handleSearch} 
              history={history}
              onClearHistory={() => setHistory([])}
            />
          </div>
        ) : (
          <div className="max-w-7xl mx-auto w-full px-6 py-12 space-y-12">
            {/* Search Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <button 
                onClick={() => setStatus(SearchStatus.IDLE)}
                className="flex items-center gap-2 text-zinc-500 hover:text-emerald-600 font-bold transition-all group"
              >
                <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20">
                  <ArrowLeft className="w-5 h-5" />
                </div>
                New Search
              </button>
              
              {status === SearchStatus.SEARCHING && (
                <div className="flex items-center gap-3 text-emerald-600 font-bold animate-pulse">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Searching Global Jurisdictions...
                </div>
              )}
            </div>

            {status === SearchStatus.ERROR && (
              <div className="p-12 bg-red-50 dark:bg-red-900/10 rounded-3xl border border-red-100 dark:border-red-900/30 flex flex-col items-center text-center gap-6 animate-in zoom-in-95">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center text-red-600">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-serif font-bold text-zinc-900 dark:text-zinc-50">Search Failed</h3>
                  <p className="text-zinc-500 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">{errorMsg}</p>
                </div>
                <button 
                  onClick={() => setStatus(SearchStatus.IDLE)}
                  className="bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 px-8 py-3 rounded-xl font-bold shadow-lg active:scale-95 transition-all"
                >
                  Try Again
                </button>
              </div>
            )}

            {(status === SearchStatus.SUCCESS || status === SearchStatus.SEARCHING) && (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 items-start">
                {/* Main Results */}
                <div className="lg:col-span-3 space-y-8">
                  <ResultsToolbar 
                    totalResults={status === SearchStatus.SEARCHING ? 0 : filteredAndSortedCases.length}
                    sortOption={sortOption}
                    onSortChange={setSortOption}
                    jurisdictions={jurisdictions}
                    selectedJurisdiction={selectedJurisdiction}
                    onJurisdictionChange={setSelectedJurisdiction}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                  />

                  {status === SearchStatus.SEARCHING ? (
                    <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <CaseSkeleton key={i} viewMode={viewMode} />
                      ))}
                    </div>
                  ) : filteredAndSortedCases.length === 0 ? (
                    <div className="p-24 text-center space-y-4 opacity-50">
                      <Search className="w-12 h-12 mx-auto text-zinc-300" />
                      <p className="text-lg font-medium">No cases match your current filters.</p>
                    </div>
                  ) : (
                    <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                      {filteredAndSortedCases.map((c, idx) => (
                        <CaseCard 
                          key={idx} 
                          caseData={c} 
                          onAnalyze={handleAnalyze}
                          isBookmarked={bookmarks.some(b => b.citation === c.citation)}
                          onToggleBookmark={toggleBookmark}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Sidebar: Grounding Sources */}
                <aside className="space-y-8 sticky top-32">
                  <div className="p-8 bg-zinc-900 dark:bg-zinc-800 rounded-3xl text-white space-y-6 shadow-2xl shadow-zinc-950/20">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg">Grounding</h4>
                        <p className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold">Verified Sources</p>
                      </div>
                    </div>
                    
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      These results are grounded in real-time data from authoritative legal databases and official court records.
                    </p>

                    <div className="space-y-3">
                      {status === SearchStatus.SEARCHING ? (
                        [1, 2, 3].map((i) => (
                          <div key={i} className="h-10 w-full bg-white/5 rounded-xl animate-pulse" />
                        ))
                      ) : groundingSources.length > 0 ? (
                        groundingSources.map((source, idx) => (
                          <a 
                            key={idx}
                            href={source.web?.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
                          >
                            <div className="mt-1">
                              <ExternalLink className="w-3 h-3 text-emerald-500" />
                            </div>
                            <span className="text-xs font-medium text-zinc-300 group-hover:text-white transition-colors line-clamp-2">
                              {source.web?.title}
                            </span>
                          </a>
                        ))
                      ) : (
                        <div className="text-xs text-zinc-500 italic">No direct grounding links available for this specific query.</div>
                      )}
                    </div>
                  </div>

                  <div className="p-8 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-400">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-zinc-900 dark:text-zinc-50">AI Insights</h4>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      Use the <strong>Deep Analysis</strong> feature on any case to unlock AI-powered legal reasoning and precedent mapping.
                    </p>
                  </div>
                </aside>
              </div>
            )}
          </div>
        )}
      </main>

      <AnalysisModal 
        isOpen={isAnalysisModalOpen}
        onClose={() => setIsAnalysisModalOpen(false)}
        caseData={selectedCase}
        analysis={analysis}
        isLoading={isAnalysisLoading}
        error={analysisError}
      />

      <footer className="px-8 py-12 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3 opacity-50 grayscale hover:grayscale-0 transition-all">
            <Scale className="w-6 h-6" />
            <span className="font-serif font-bold text-xl">LexiFind</span>
          </div>
          <div className="flex items-center gap-8 text-xs font-bold uppercase tracking-widest text-zinc-400">
            <a href="#" className="hover:text-emerald-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-emerald-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-emerald-600 transition-colors">Contact</a>
          </div>
          <p className="text-xs text-zinc-400 font-medium">
            © 2026 LexiFind Global. Powered by Gemini 3.1.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
