# app/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    jwt_secret: str
    cors_origins: str

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()