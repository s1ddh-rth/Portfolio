FROM node:18-alpine

WORKDIR /packages/ai

# Install system dependencies
RUN apk add --no-cache curl bash python3 build-base

# Copy package files
COPY packages/ai/package*.json ./
COPY packages/ai/tsconfig.json ./

# Install all dependencies
RUN npm install

# Copy source code
COPY packages/ai/src ./src

# Build TypeScript
RUN npm run build

# Set environment variables
ENV NODE_ENV=development
ENV OLLAMA_MODEL=mistral
ENV QDRANT_COLLECTION=portfolio_knowledge

# Copy and make init script executable
COPY infra/scripts/init-ai.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/init-ai.sh

# Use the init script as entry point
ENTRYPOINT ["init-ai.sh"] 