export interface Document {
  id: string;
  content: string;
  metadata: {
    source: 'github' | 'resume' | 'blog';
    type: string;
    url?: string;
    title?: string;
    date?: string;
    [key: string]: any;
  };
}

export interface EmbeddingVector {
  id: string;
  values: number[];
  metadata: Document['metadata'];
}

export interface SearchResult {
  document: Document;
  score: number;
}

export interface RAGConfig {
  collection_name: string;
  similarity_threshold: number;
  max_results?: number;
} 