from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field
from datetime import datetime

class MCPMessage(BaseModel):
    role: str
    content: str
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)
    timestamp: float = Field(default_factory=lambda: datetime.now().timestamp())

class MCPContext(BaseModel):
    messages: List[MCPMessage] = Field(default_factory=list)
    system_prompt: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    def add_message(self, role: str, content: str, metadata: Optional[Dict[str, Any]] = None) -> None:
        self.messages.append(
            MCPMessage(
                role=role,
                content=content,
                metadata=metadata or {}
            )
        )
    
    def get_context_window(self, max_messages: int = 10) -> List[MCPMessage]:
        """Get the most recent messages within the context window."""
        return self.messages[-max_messages:]
    
    def clear(self) -> None:
        """Clear all messages but keep system prompt and metadata."""
        self.messages = []

class MCPResponse(BaseModel):
    message: MCPMessage
    usage: Dict[str, int]
    model: str
    finish_reason: Optional[str] = None

class MCPRequest(BaseModel):
    messages: List[MCPMessage]
    model: str
    temperature: float = 0.7
    max_tokens: Optional[int] = None
    stream: bool = False
    metadata: Dict[str, Any] = Field(default_factory=dict)

class MCPManager:
    def __init__(self):
        self.contexts: Dict[str, MCPContext] = {}
    
    def create_context(self, context_id: str, system_prompt: Optional[str] = None) -> MCPContext:
        context = MCPContext(system_prompt=system_prompt)
        self.contexts[context_id] = context
        return context
    
    def get_context(self, context_id: str) -> Optional[MCPContext]:
        return self.contexts.get(context_id)
    
    def delete_context(self, context_id: str) -> None:
        if context_id in self.contexts:
            del self.contexts[context_id]

mcp_manager = MCPManager() 