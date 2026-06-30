import os

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from api.core.logging_config import get_logger, setup_logging
from api.core.settings import settings
from api.middlewarre.request_id import request_id_middleware
from api.routers.redirect_router import router as redirect_router
from apscheduler.schedulers.background import BackgroundScheduler
from api.services.twiiter_daily_post import generate_daily_tweets_job
from posts.instagram.main import generate_today as generate_instagram_post
from posts.instagram.main import publish_today as publish_instagram_post
from api.deps import get_db

# ======================================================
# Logger
# ======================================================


setup_logging()
logger = get_logger("api")

# ======================================================
# Schemas
# ======================================================

from api.routers import (affiliates, categories, deals, go,
                         health, offers, prices, products, twitter_content)
from api.schemas.error import ErrorResponse

# ======================================================
# Routers
# ======================================================


# ======================================================
# App
# ======================================================

app = FastAPI(
    title="PromoDeals API",
    description="API pública para agregação de promoções com detecção de queda real de preço.",
    version="1.0.0",
    debug=settings.DEBUG,
)

# ======================================================
# CORS
# ======================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev
        "http://127.0.0.1:5173",
        "https://promoly-core.vercel.app",  # Vercel frontend
        "https://promoly-core-ilqs.vercel.app",  # Vercel frontend (backup)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ======================================================
# Middlewares
# ======================================================

app.middleware("http")(request_id_middleware)

# ======================================================
# Static (assets do Instagram, baixados pela Graph API via URL pública)
# ======================================================

_INSTAGRAM_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "instagram")
os.makedirs(_INSTAGRAM_DIR, exist_ok=True)
app.mount("/instagram", StaticFiles(directory=_INSTAGRAM_DIR), name="instagram")

# ======================================================
# Global Exception Handlers
# ======================================================

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):

    logger.warning(
        f"HTTPException {exc.status_code} on {request.method} {request.url} - {exc.detail}"
    )

    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            message=str(exc.detail),
            code="HTTP_ERROR",
        ).model_dump(),
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):

    logger.exception(
        f"Unhandled exception on {request.method} {request.url}"
    )

    return JSONResponse(
        status_code=500,
        content=ErrorResponse(
            message="Erro interno inesperado.",
            code="INTERNAL_SERVER_ERROR",
        ).model_dump(),
    )


#==============================
# TWITTER JOB
#==============================

scheduler = BackgroundScheduler(timezone="America/Sao_Paulo")


def scheduled_job():
    db = next(get_db())
    generate_daily_tweets_job(db)
    db.close()


def instagram_job():
    # Gera os assets do dia e publica no feed. Resiliente: falha de geração ou
    # de publicação (ex.: vars IG ausentes) loga mas não derruba o scheduler.
    try:
        generate_instagram_post()
    except Exception:
        logger.exception("Falha ao gerar post do Instagram")
        return

    try:
        publish_instagram_post()
    except Exception:
        logger.exception("Falha ao publicar post do Instagram")


def start_scheduler():
    scheduler.add_job(
        scheduled_job,
        trigger="cron",
        hour=11,
        minute=0
    )
    scheduler.add_job(
        instagram_job,
        trigger="cron",
        hour=12,
        minute=0
    )
    scheduler.start()


@app.on_event("startup")
def startup_event():
    logger.info("🕗 Iniciando schedulers (tweets + instagram)...")
    start_scheduler()


# ======================================================
# Register Routers
# ======================================================

app.include_router(products.router)
app.include_router(deals.router)
app.include_router(offers.router)
app.include_router(categories.router)
app.include_router(prices.router)
app.include_router(affiliates.router)
app.include_router(go.router)
app.include_router(health.router)
app.include_router(twitter_content.router)
app.include_router(redirect_router)
