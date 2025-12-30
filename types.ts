
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  status?: 'loading' | 'error' | 'success';
  groundingUrls?: Array<{ uri: string; title: string }>;
}

export interface HadithResult {
  text: string;
  source: string;
  grade: string;
  links: string[];
  notes?: string;
}
