import os
from dotenv import load_dotenv


ENVIRONMENT = os.getenv("ENVIRONMENT", "production")

if ENVIRONMENT == "production":
    load_dotenv(".env.prod")
else:
    load_dotenv(".env.dev")


class Settings:
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    DATABASE_URL: str = os.getenv("DATABASE_URL")


settings = Settings()
