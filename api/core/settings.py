import os
from dotenv import load_dotenv


ENVIRONMENT = os.getenv("ENVIRONMENT", "production")

# Carrega o .env específico do ambiente, com fallback pro .env genérico.
_env_file = ".env.prod" if ENVIRONMENT == "production" else ".env.dev"
load_dotenv(_env_file)
load_dotenv(".env")  # fallback / valores compartilhados


class Settings:
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    DATABASE_URL: str = os.getenv("DATABASE_URL")

    # Chave para rotas sensíveis (geração de posts, etc).
    # Se vazia, as rotas protegidas ficam bloqueadas (fail-closed).
    API_KEY: str = os.getenv("API_KEY", "")

    # Rate-limit dos redirects: nº máx. de requisições por IP por janela.
    REDIRECT_RATE_LIMIT: int = int(os.getenv("REDIRECT_RATE_LIMIT", "60"))
    REDIRECT_RATE_WINDOW: int = int(os.getenv("REDIRECT_RATE_WINDOW", "60"))


settings = Settings()
