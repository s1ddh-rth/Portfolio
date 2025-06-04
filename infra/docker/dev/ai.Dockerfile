FROM node:18-alpine

WORKDIR /packages/ai

# Install system dependencies
RUN apk add --no-cache curl bash

# Copy init script first and make it executable
COPY infra/scripts/init-ollama.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/init-ollama.sh

# Install dependencies
COPY packages/ai/package*.json ./
RUN npm install @qdrant/js-client-rest langchain @types/node

# Copy source code
COPY packages/ai/src ./src

# Set environment variables
ENV NODE_ENV=development
ENV OLLAMA_MODEL=mistral
ENV QDRANT_COLLECTION=portfolio_knowledge

# Use the init script as entry point
ENTRYPOINT ["init-ollama.sh"] 