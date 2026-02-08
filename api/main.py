from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routers import (
    affiliates,
    deals,
    health,
    prices,
    products,
    go,
    offers as offers_router,
)

app = FastAPI(title="Promoly API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8080",
        "https://promoly-core.vercel.app/",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(offers_router.router)
app.include_router(products.router)
app.include_router(prices.router)
app.include_router(affiliates.router)
app.include_router(deals.router)
app.include_router(go.router)
app.include_router(health.router)
