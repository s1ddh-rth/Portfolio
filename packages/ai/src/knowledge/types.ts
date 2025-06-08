import { Document } from 'langchain/document';

export type KnowledgeSource = 'github' | 'resume' | 'blog' | 'twitter' | 'linkedin';

export interface DocumentMetadata {
  source: KnowledgeSource;
  url?: string;
  title?: string;
  date?: string;
  type?: string;
  tags?: string[];
}

export type PortfolioDocument = Document<DocumentMetadata>;

export interface GithubConfig {
  username: string;
  repositories?: string[];
  includeIssues?: boolean;
  includeReadmes?: boolean;
}

export interface BlogConfig {
  rssUrl?: string;
  mediumUsername?: string;
  devToUsername?: string;
}

export interface ResumeConfig {
  filePath: string;
  format: 'json' | 'pdf' | 'markdown';
}

export interface SocialConfig {
  twitter?: {
    username: string;
    includeReplies?: boolean;
    maxTweets?: number;
  };
  linkedin?: {
    profileUrl: string;
    includeArticles?: boolean;
  };
}

export interface KnowledgeBaseConfig {
  github?: GithubConfig;
  blog?: BlogConfig;
  resume?: ResumeConfig;
  social?: SocialConfig;
  refreshInterval?: number; // in minutes
} 