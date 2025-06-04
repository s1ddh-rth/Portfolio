from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Portfolio AI API"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"
    
    # Model settings
    OLLAMA_HOST: str = "http://ollama:11434"
    QDRANT_HOST: str = "http://qdrant:6333"
    DEFAULT_MODEL: str = "llama2"  # or any other model you prefer
    
    # MCP Settings
    MCP_VERSION: str = "0.1.0"
    MCP_MAX_TOKENS: int = 4096
    MCP_TEMPERATURE: float = 0.7
    MCP_CONTEXT_WINDOW: int = 8192  # Depends on the model being used
    
    # Security
    SECRET_KEY: str = "development_key"  # Change in production
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings() 