# AI Agent for Portfolio

This package contains the AI agent implementation for your portfolio website.

## Setup

1. Create a `.env` file in this directory with the following variables:

```env
# Vector Database Configuration
QDRANT_URL=http://localhost:6333

# LLM Configuration
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama2

# GitHub Configuration
GITHUB_TOKEN=your_github_token
GITHUB_USERNAME=your_username

# Twitter Configuration
TWITTER_API_KEY=your_twitter_api_key
TWITTER_USERNAME=your_twitter_handle

# Blog Configuration (optional)
BLOG_URL=your_blog_url
MEDIUM_USERNAME=your_medium_username
DEV_TO_USERNAME=your_devto_username

# Resume Configuration
RESUME_PATH=./data/resume.pdf

# Social Profiles
LINKEDIN_PROFILE_URL=your_linkedin_profile_url

# Vector DB Collection Names (optional - will use defaults if not set)
RESUME_COLLECTION=resume
BLOG_COLLECTION=blog
GITHUB_COLLECTION=github
SOCIAL_COLLECTION=social
```

2. Install dependencies:
```bash
npm install
```

3. Start the services (from root directory):
```bash
docker-compose up -d
```

4. Build the package:
```bash
npm run build
```

## Directory Structure

```
src/
├── knowledge/           # Knowledge base implementations
│   ├── types.ts        # Type definitions
│   ├── base.ts         # Base knowledge class
│   ├── resume.ts       # Resume processor
│   ├── blog.ts         # Blog processor
│   ├── github.ts       # GitHub processor
│   └── init.ts         # Initialization
├── rag/                # RAG implementation
└── config.ts           # Configuration
```

## Usage

```typescript
import { KnowledgeBaseInitializer } from './src/knowledge/init';

const init = async () => {
  const initializer = new KnowledgeBaseInitializer();
  await initializer.initialize();
};

init().catch(console.error);
``` 