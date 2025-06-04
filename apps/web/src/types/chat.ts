export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

export interface ChatStore extends ChatState {
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearMessages: () => void;
}

// Future extensibility for voice/face features
export interface AIFeatures {
  hasVoice: boolean;
  hasFace: boolean;
  isVoiceEnabled: boolean;
  isFaceEnabled: boolean;
}

export interface AIConfig {
  features: AIFeatures;
  voiceId?: string;
  faceModelId?: string;
  language: string;
  temperature: number;
} 