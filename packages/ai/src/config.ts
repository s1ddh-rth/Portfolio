import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const configSchema = z.object({
  // Vector DB Configuration
  QDRANT_URL: z.string().default('http://localhost:6333'),
  
  // LLM Configuration
  OLLAMA_URL: z.string().default('http://localhost:11434'),
  OLLAMA_MODEL: z.string().default('mistral'),
  
  // API Keys & External Services
  GITHUB_TOKEN: z.string().optional(),
  LINKEDIN_API_KEY: z.string().optional(),
  TWITTER_API_KEY: z.string().optional(),
  GOOGLE_CALENDAR_CREDENTIALS: z.string().optional(),
  
  // Knowledge Base Configuration
  RESUME_PATH: z.string().default('./data/resume.pdf'),
  BLOG_URL: z.string().optional(),
  GITHUB_USERNAME: z.string().optional(),
  LINKEDIN_PROFILE_URL: z.string().optional(),
  TWITTER_USERNAME: z.string().optional(),
  
  // Vector DB Collection Names
  RESUME_COLLECTION: z.string().default('resume'),
  BLOG_COLLECTION: z.string().default('blog'),
  GITHUB_COLLECTION: z.string().default('github'),
  SOCIAL_COLLECTION: z.string().default('social'),
});

export type Config = z.infer<typeof configSchema>;

export const config = configSchema.parse(process.env); 