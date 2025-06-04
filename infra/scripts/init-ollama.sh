#!/bin/bash

# Wait for Ollama to be ready
echo "Waiting for Ollama to be ready..."
until curl -s http://ollama:11434/api/tags > /dev/null; do
    sleep 1
done

# Pull the Mistral model
echo "Pulling Mistral model..."
curl -X POST http://ollama:11434/api/pull -d '{"name": "mistral"}'

echo "Ollama initialization complete!" 