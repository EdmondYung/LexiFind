import React, { useState, useEffect, useRef } from 'react';
import { Case, CaseAnalysis, ChatMessage } from '../types';
import { chatWithCase } from '../services/gemini';
import Markdown from 'react-markdown';
import { 
  X, 
  Send, 
  Bot, 
  User, 
  Download, 
  MessageSquare, 
  Scale, 
  AlertCircle, 
  Loader2, 
  ArrowLeft,
  ChevronRight,
  BookOpen
} from 'lucide-react';

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseData: Case | null;
  analysis: CaseAnalysis | null;
  isLoading: boolean;
  error: string | null;
}

export const AnalysisModal: React.FC<AnalysisModalProps> = ({ 
  isOpen, 
  onClose, 
  caseData, 
  analysis, 
  isLoading,
  error
}) => {
  const [activeTab, setActiveTab] = useState<'analysis' | 'chat'>('analysis');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [userMsg, setUserMsg] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setChatHistory([]);
      setActiveTab('analysis');
    }
  }, [isOpen]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userMsg.trim() || !caseData || isChatLoading) return;

    const newMsg: ChatMessage = { role: 'user', content: userMsg.trim() };
    setChatHistory(prev => [...prev, newMsg]);
    setUserMsg('');
    setIsChatLoading(true);

    try {
      const context = `Case: ${caseData.name}\nSummary: ${caseData.summary}\nCitation: ${caseData.citation}`;
      const response = await chatWithCase(context, newMsg.content, chatHistory);
      setChatHistory(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'assistant', content: "I'm sorry, I encountered an error processing your request." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const exportToMarkdown = () => {
    if (!caseData || !analysis) return;
    const content = `# Legal Analysis: ${caseData.name}\n\n## Summary\n${analysis.summary}\n\n## Key Points\n${analysis.keyPoints.map(p => `- ${p}`).join('\n')}\n\n## Implications\n${analysis.implications}`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${caseData.name.replace(/\s+/g, '_')}_analysis.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
      <div 
        className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      
      <div className="relative w-full max-w-6xl h-full max-h-[90vh] bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 border border-zinc-200 dark:border-zinc-800">
        {/* Header */}
        <div className="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-4">
            <button 
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-2xl font-serif font-bold text-zinc-900 dark:text-zinc-50 truncate max-w-md">
                {caseData?.name || 'Case Analysis'}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium tracking-wider uppercase">
                {caseData?.citation} • {caseData?.jurisdiction}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={exportToMarkdown}
              disabled={!analysis}
              className="p-2.5 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-all disabled:opacity-30"
              title="Export to Markdown"
            >
              <Download className="w-5 h-5" />
            </button>
            <button 
              onClick={onClose}
              className="p-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-zinc-400 hover:text-red-500 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex px-8 border-b border-zinc-100 dark:border-zinc-800 gap-8">
          {[
            { id: 'analysis', label: 'Deep Analysis', icon: Scale },
            { id: 'chat', label: 'Interactive Chat', icon: MessageSquare }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 flex items-center gap-2 text-sm font-bold transition-all relative ${
                activeTab === tab.id 
                  ? 'text-emerald-600' 
                  : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 bg-zinc-50/30 dark:bg-zinc-900/30">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 animate-pulse">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-600">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 font-medium">Analyzing legal precedents...</p>
            </div>
          ) : error ? (
            <div className="h-full flex flex-col items-center justify-center gap-6 max-w-md mx-auto text-center">
              <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center text-red-500">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Analysis Failed</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{error}</p>
              </div>
              <button 
                onClick={onClose}
                className="px-6 py-2.5 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-xl font-bold text-sm transition-all active:scale-95"
              >
                Go Back
              </button>
            </div>
          ) : activeTab === 'analysis' ? (
            <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-500">
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-600 font-bold uppercase tracking-widest text-[10px]">
                  <BookOpen className="w-3 h-3" />
                  Executive Summary
                </div>
                <div className="p-6 bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-100 dark:border-zinc-700 shadow-sm">
                  <p className="text-lg text-zinc-700 dark:text-zinc-200 leading-relaxed font-serif italic">
                    {analysis?.summary}
                  </p>
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-600 font-bold uppercase tracking-widest text-[10px]">
                  <Scale className="w-3 h-3" />
                  Key Legal Points
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysis?.keyPoints.map((point, idx) => (
                    <div key={idx} className="p-4 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-700 flex gap-3 group hover:border-emerald-200 dark:hover:border-emerald-900 transition-colors">
                      <div className="mt-1">
                        <ChevronRight className="w-4 h-4 text-emerald-500 group-hover:translate-x-1 transition-transform" />
                      </div>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{point}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-600 font-bold uppercase tracking-widest text-[10px]">
                  <AlertCircle className="w-3 h-3" />
                  Broader Implications
                </div>
                <div className="p-8 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100/50 dark:border-emerald-900/30">
                  <div className="markdown-body">
                    <Markdown>{analysis?.implications}</Markdown>
                  </div>
                </div>
              </section>
            </div>
          ) : (
            <div className="h-full flex flex-col max-w-4xl mx-auto">
              <div className="flex-1 space-y-6 pb-8">
                {chatHistory.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center gap-4 opacity-50">
                    <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-medium">Ask specific questions about this case's holding, <br/>precedents, or legal reasoning.</p>
                  </div>
                )}
                {chatHistory.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={`flex gap-4 animate-in slide-in-from-bottom-2 duration-300 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      msg.role === 'user' 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900'
                    }`}>
                      {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                    </div>
                    <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-emerald-600 text-white rounded-tr-none' 
                        : 'bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-tl-none shadow-sm'
                    }`}>
                      <div className="markdown-body">
                        <Markdown>{msg.content}</Markdown>
                      </div>
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex gap-4 animate-pulse">
                    <div className="w-10 h-10 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
                    <div className="h-12 bg-zinc-200 dark:bg-zinc-800 rounded-2xl w-32" />
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="sticky bottom-0 pt-4 bg-zinc-50/50 dark:bg-zinc-900/50 backdrop-blur-sm">
                <div className="relative group">
                  <input
                    type="text"
                    value={userMsg}
                    onChange={(e) => setUserMsg(e.target.value)}
                    placeholder="Ask a question about this case..."
                    className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-6 py-4 pr-16 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-lg"
                  />
                  <button
                    type="submit"
                    disabled={!userMsg.trim() || isChatLoading}
                    className="absolute right-2 top-2 bottom-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-30 text-white px-4 rounded-xl transition-all active:scale-90"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
