from pydantic_settings import BaseSettings
from typing import Optional
import os
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    database_url: str = "postgresql://aidr_user:aidr_password@localhost:5432/aidr_db"
    openai_api_key: str = ""
    twitter_bearer_token: str = ""
    environment: str = "development"
    
    model_config = {
        "env_file": ".env",
        "extra": "allow"
    }

settings = Settings()