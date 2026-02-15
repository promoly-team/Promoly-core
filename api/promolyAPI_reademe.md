# 🚀 PromoDeals API

Backend API responsible for exposing public product data, price history,
real discount detection, and affiliate-based redirection.

Built with:

- FastAPI
- SQLAlchemy
- PostgreSQL
- Layered Architecture (Router → Service → Repository)

---

# Overview

PromoDeals API provides:

- Public product listing
- Real discount detection (based on price history)
- Historical price tracking
- Category filtering
- Search capability
- Affiliate redirection with click tracking
- Health monitoring endpoint

Designed to serve as the backend for a promotional product platform
focused on affiliate monetization.

---

# Architecture

Router → Service → Repository → Database

Folder Structure:

api/
 ├── routers/
 ├── services/
 ├── schemas/
 ├── utils/
 ├── deps.py
 └── main.py

database/
 ├── models/
 ├── repositories/
 └── connection.py

---

# Data Model

## Product
- id
- titulo
- descricao
- imagem_url
- preco
- avaliacao
- url_afiliada
- updated_at

## Price History
Table: produto_preco_historico
- produto_id
- preco
- created_at

## Categories
Many-to-many via produto_categoria

## Affiliate Links
Table: links_afiliados
Only status = 'ok' links are valid.

## Click Tracking
Table: clicks
- produto_id
- plataforma_id
- ip
- user_agent
- created_at

---

# API Endpoints

Base URL:
http://localhost:8080

GET /products
GET /products/{id}
GET /products/total
GET /deals
GET /offers
GET /prices/{produto_id}
GET /categories/{categoria_id}/products
GET /go/{produto_id}
GET /health

---

# Business Rules

Discount is valid only if:
previous_price > current_price

Formula:
((previous - current) / previous) * 100

---

# Running the Project

1. Install dependencies
pip install -r requirements.txt

2. Set environment variable
DATABASE_URL=postgresql://user:password@host:port/database

3. Run
uvicorn api.main:app --host 0.0.0.0 --port 8080

---

Swagger:
/docs#