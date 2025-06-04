FROM node:18-alpine

WORKDIR /packages/ai

# Install dependencies
COPY packages/ai/package*.json ./
RUN npm install @qdrant/js-client-rest langchain @types/node

# Copy source code
COPY packages/ai/src ./src

# Set environment variables
ENV NODE_ENV=development
ENV OLLAMA_MODEL=mistral
ENV QDRANT_COLLECTION=portfolio_knowledge 