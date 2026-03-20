export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface Case {
  name: string;
  citation: string;
  jurisdiction: string;
  date: string;
  summary: string;
  tags: string[];
  fullTextUrl?: string;
}

export interface SearchResponse {
  cases: Case[];
  groundingChunks: GroundingChunk[];
}

export enum SearchStatus {
  IDLE = 'IDLE',
  SEARCHING = 'SEARCHING',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface CaseAnalysis {
  summary: string;
  keyPoints: string[];
  implications: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export type SortOption = 'relevance' | 'date_desc' | 'date_asc';