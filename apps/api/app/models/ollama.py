from typing import AsyncGenerator, Dict, List, Optional
import httpx
from app.core.config import settings
from app.core.mcp import MCPMessage, MCPRequest, MCPResponse

class OllamaClient:
    def __init__(self, base_url: str = settings.OLLAMA_HOST):
        self.base_url = base_url
        self.client = httpx.AsyncClient(base_url=base_url, timeout=30.0)
    
    async def generate(self, request: MCPRequest) -> MCPResponse:
        """Generate a response using Ollama."""
        messages = [
            {
                "role": msg.role,
                "content": msg.content
            }
            for msg in request.messages
        ]
        
        response = await self.client.post(
            "/api/generate",
            json={
                "model": request.model,
                "messages": messages,
                "options": {
                    "temperature": request.temperature,
                    "num_predict": request.max_tokens or settings.MCP_MAX_TOKENS,
                }
            }
        )
        response.raise_for_status()
        data = response.json()
        
        return MCPResponse(
            message=MCPMessage(
                role="assistant",
                content=data["response"],
                metadata={"model": request.model}
            ),
            usage={
                "prompt_tokens": data.get("prompt_eval_count", 0),
                "completion_tokens": data.get("eval_count", 0),
                "total_tokens": data.get("total_eval_count", 0)
            },
            model=request.model,
            finish_reason=data.get("done", "stop")
        )
    
    async def generate_stream(self, request: MCPRequest) -> AsyncGenerator[MCPResponse, None]:
        """Generate a streaming response using Ollama."""
        messages = [
            {
                "role": msg.role,
                "content": msg.content
            }
            for msg in request.messages
        ]
        
        async with self.client.stream(
            "POST",
            "/api/generate",
            json={
                "model": request.model,
                "messages": messages,
                "options": {
                    "temperature": request.temperature,
                    "num_predict": request.max_tokens or settings.MCP_MAX_TOKENS,
                },
                "stream": True
            }
        ) as response:
            async for line in response.aiter_lines():
                if not line:
                    continue
                    
                chunk = httpx.json.loads(line)
                yield MCPResponse(
                    message=MCPMessage(
                        role="assistant",
                        content=chunk["response"],
                        metadata={"model": request.model, "streaming": True}
                    ),
                    usage={
                        "prompt_tokens": chunk.get("prompt_eval_count", 0),
                        "completion_tokens": chunk.get("eval_count", 0),
                        "total_tokens": chunk.get("total_eval_count", 0)
                    },
                    model=request.model,
                    finish_reason=None if not chunk.get("done") else "stop"
                )
    
    async def close(self):
        await self.client.aclose()

ollama_client = OllamaClient() 