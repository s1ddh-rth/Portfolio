from fastapi import FastAPI, WebSocket, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Optional
import uuid

from app.core.config import settings
from app.core.mcp import MCPRequest, MCPMessage, mcp_manager
from app.models.ollama import ollama_client

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI-powered portfolio API with MCP support",
    version=settings.VERSION,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Update for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "Portfolio AI API is running",
        "mcp_version": settings.MCP_VERSION
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "version": settings.VERSION,
        "services": {
            "ollama": "connected",  # TODO: Add actual health checks
            "qdrant": "connected"
        }
    }

@app.post("/api/v1/chat")
async def chat(request: Dict[str, str]):
    session_id = request.get("session_id", str(uuid.uuid4()))
    message = request.get("message")
    
    if not message:
        raise HTTPException(status_code=400, detail="Message is required")
    
    # Get or create context
    context = mcp_manager.get_context(session_id)
    if not context:
        context = mcp_manager.create_context(
            session_id,
            system_prompt="You are a helpful AI assistant for my portfolio website."
        )
    
    # Add user message to context
    context.add_message("user", message)
    
    # Create MCP request
    mcp_request = MCPRequest(
        messages=context.get_context_window(),
        model=settings.DEFAULT_MODEL,
        temperature=settings.MCP_TEMPERATURE
    )
    
    # Generate response
    response = await ollama_client.generate(mcp_request)
    
    # Add assistant response to context
    context.add_message(
        "assistant",
        response.message.content,
        metadata={"model": response.model}
    )
    
    return {
        "session_id": session_id,
        "response": response.message.content,
        "usage": response.usage
    }

@app.websocket("/api/v1/chat/stream")
async def chat_stream(websocket: WebSocket):
    await websocket.accept()
    
    try:
        while True:
            # Receive message
            data = await websocket.receive_json()
            session_id = data.get("session_id", str(uuid.uuid4()))
            message = data.get("message")
            
            if not message:
                await websocket.send_json({"error": "Message is required"})
                continue
            
            # Get or create context
            context = mcp_manager.get_context(session_id)
            if not context:
                context = mcp_manager.create_context(
                    session_id,
                    system_prompt="You are a helpful AI assistant for my portfolio website."
                )
            
            # Add user message to context
            context.add_message("user", message)
            
            # Create MCP request
            mcp_request = MCPRequest(
                messages=context.get_context_window(),
                model=settings.DEFAULT_MODEL,
                temperature=settings.MCP_TEMPERATURE,
                stream=True
            )
            
            # Stream response
            async for chunk in ollama_client.generate_stream(mcp_request):
                await websocket.send_json({
                    "session_id": session_id,
                    "chunk": chunk.message.content,
                    "done": chunk.finish_reason == "stop"
                })
                
                if chunk.finish_reason == "stop":
                    # Add complete response to context
                    context.add_message(
                        "assistant",
                        chunk.message.content,
                        metadata={"model": chunk.model}
                    )
    
    except Exception as e:
        await websocket.close()
        raise e

@app.on_event("shutdown")
async def shutdown_event():
    await ollama_client.close() 