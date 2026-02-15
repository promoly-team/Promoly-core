from pydantic import BaseModel


class ErrorResponse(BaseModel):
    """
    Modelo padrão de resposta de erro da API.
    """

    error: bool = True
    message: str
    code: str
