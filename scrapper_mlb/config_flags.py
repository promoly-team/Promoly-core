from dotenv import load_dotenv
import os

load_dotenv()

def get_enabled_categories():
    """
    Retorna lista de categorias habilitadas via env.
    Se vazio ou não definido, retorna None (todas habilitadas).
    """
    raw = os.getenv("SCRAPER_ENABLED_CATEGORIES")

    if not raw:
        return None  # significa: todas habilitadas

    return [c.strip() for c in raw.split(",") if c.strip()]
