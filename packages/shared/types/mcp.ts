export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface ChatSession {
  id: string;
  messages: Message[];
  created_at: number;
  updated_at: number;
  metadata?: Record<string, any>;
}

export interface ChatRequest {
  message: string;
  session_id?: string;
  model?: string;
  temperature?: number;
  stream?: boolean;
  metadata?: Record<string, any>;
}

export interface ChatResponse {
  session_id: string;
  response: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  metadata?: Record<string, any>;
}

export interface StreamChunk {
  session_id: string;
  chunk: string;
  done: boolean;
  metadata?: Record<string, any>;
}

// AI Feature interfaces
export interface VoiceConfig {
  enabled: boolean;
  provider: 'elevenlabs' | 'playht' | 'custom';
  voice_id?: string;
  language?: string;
}

export interface FaceConfig {
  enabled: boolean;
  provider: 'did' | 'heygen' | 'custom';
  model_id?: string;
  expressions?: string[];
}

export interface AIConfig {
  voice: VoiceConfig;
  face: FaceConfig;
  temperature: number;
  max_tokens?: number;
  context_window?: number;
} 