"""
Segurança da API: verificação de API key e rate-limit simples.

O rate-limit é in-memory (por processo). Suficiente para deploy
single-instance. Se a API rodar com múltiplos workers/réplicas,
migrar para um store compartilhado (Redis).
"""

import time
import threading
from collections import defaultdict, deque

from fastapi import Header, HTTPException, Request

from api.core.settings import settings


# =====================================================
# API KEY (rotas sensíveis)
# =====================================================

def require_api_key(x_api_key: str | None = Header(default=None)) -> None:
    """
    Dependency FastAPI. Bloqueia se a API_KEY não estiver
    configurada (fail-closed) ou se o header não bater.
    """
    if not settings.API_KEY:
        raise HTTPException(
            status_code=503,
            detail="API_KEY não configurada no servidor.",
        )

    if x_api_key != settings.API_KEY:
        raise HTTPException(
            status_code=401,
            detail="API key inválida ou ausente.",
        )


# =====================================================
# RATE LIMIT (por IP, janela deslizante)
# =====================================================

_hits: dict[str, deque] = defaultdict(deque)
_lock = threading.Lock()


def rate_limit_redirect(request: Request) -> None:
    """
    Dependency FastAPI. Limita requisições por IP numa janela
    deslizante. Configurável via REDIRECT_RATE_LIMIT / WINDOW.
    """
    limit = settings.REDIRECT_RATE_LIMIT
    window = settings.REDIRECT_RATE_WINDOW

    ip = request.client.host if request.client else "unknown"
    now = time.monotonic()

    with _lock:
        bucket = _hits[ip]
        while bucket and bucket[0] <= now - window:
            bucket.popleft()

        if len(bucket) >= limit:
            raise HTTPException(
                status_code=429,
                detail="Muitas requisições. Tente novamente em instantes.",
            )

        bucket.append(now)
