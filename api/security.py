from fastapi import Header, HTTPException, status
import os

API_KEY = os.getenv("API_KEY")

def require_api_key(x_api_key: str = Header(...)):
    if API_KEY is None:
        raise RuntimeError("API_KEY não configurada")

    if x_api_key != API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API Key inválida",
        )
