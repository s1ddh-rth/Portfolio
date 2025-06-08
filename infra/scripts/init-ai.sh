#!/bin/bash

# Wait for Ollama to be ready
echo "Waiting for Ollama to be ready..."
until curl -s http://ollama:11434/api/tags > /dev/null; do
    sleep 1
done

# Pull the Mistral model
echo "Pulling Mistral model..."
curl -X POST http://ollama:11434/api/pull -d '{"name": "mistral"}'

# Wait for Qdrant to be ready
echo "Waiting for Qdrant to be ready..."
until curl -s http://qdrant:6333/collections > /dev/null; do
    sleep 1
done

echo "Services are ready!"

# Initialize knowledge base
echo "Initializing knowledge base..."
cd /packages/ai
node dist/knowledge/init.js

# Keep container running
tail -f /dev/null 