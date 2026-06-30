import os
from dotenv import load_dotenv

# Fonte única de configuração: .env (mesmo arquivo usado por database/db.py
# e pelos posters do Instagram).
load_dotenv()


class Settings:
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    DATABASE_URL: str = os.getenv("DATABASE_URL")


settings = Settings()
