import uuid
from fastapi import Request
from starlette.responses import Response


async def request_id_middleware(request: Request, call_next):
    """
    Middleware responsável por:

    - Gerar um Request ID único
    - Adicionar no header da resposta
    - Tornar o ID acessível durante o ciclo da requisição
    """

    request_id = str(uuid.uuid4())

    # salva no state para uso interno (logs, etc)
    request.state.request_id = request_id

    try:
        response: Response = await call_next(request)
    except Exception:
        # se der erro antes da response existir
        raise

    # adiciona header
    response.headers["X-Request-ID"] = request_id

    return response
