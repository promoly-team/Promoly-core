# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Visão geral

Promoly é uma plataforma de automação de marketing de afiliados para marketplaces brasileiros (principalmente Mercado Livre / MLB, além de Amazon). Faz scraping de produtos e preços, detecta quedas reais de preço a partir do histórico, expõe os dados por uma API pública e gera posts promocionais automáticos (WhatsApp via WAHA, Twitter). É um monorepo: backend Python + scrapers + frontend Next.js.

Código e comentários em português — manter essa convenção.

## Componentes

- **`api/`** — API pública FastAPI. Em camadas: Router → Service → Repository → Database. Entrada `api/main.py` (`app`). Roda um job APScheduler `BackgroundScheduler` (`generate_daily_tweets_job`) no startup. Atenção: diretório com erro de grafia `api/middlewarre/`.
- **`scrapper_mlb/`** — Scraper Mercado Livre. `main.py` percorre o dict aninhado `CATEGORIES` em `config.py` (categoria → subcategoria → termo → {query, min_price, max_price, max_pages}), filtrado por `config_flags.get_enabled_categories()` (feature flag via `SCRAPER_ENABLED_CATEGORIES`). Subpacotes: `services/` (extractors, normalizers, builders), `pricing/`, `product_page/`.
- **`scrapper_amazon/`** — Scraper Amazon (atualmente vazio/stub).
- **`affiliate/`** — Worker Selenium (`affiliate/selenium_worker` via `run_selenium.sh`) que gera links de afiliado; usa `chrome-profile/` persistente.
- **`database/`** — Camada SQLAlchemy compartilhada. `db.py` monta o engine a partir de `DATABASE_URL` (PostgreSQL). O `Base` daqui é exigido pelo Alembic. Os repositórios em `database/repositories/` são a camada de acesso a dados usada pela API e pelos scrapers.
- **`gerador_posts/`, `posts/`** — Geração de imagens/posts promocionais (Twitter, remoção de fundo de imagem).
- **`promoly-next/`** — Frontend Next.js 16 + React 19 (TypeScript, Tailwind v3, Recharts). Deploy na Vercel; consome a API via `VITE_API_URL`.
- **`migrations/`** — Migrations Alembic (`script_location` = migrations).

## Comandos

### Backend (Python)
Ativar venv: `source /home/leandro/Documents/env/bin/activate`. `pythonpath=.` está definido em `pytest.ini`, então rode a partir da raiz do repo.

```bash
pip install -r requirements.txt

# API
uvicorn api.main:app --reload --port 8080

# Scraper MLB
python -m scrapper_mlb.main

# Worker Selenium de afiliado (precisa de PROMOLY_DB_PATH)
python -m affiliate.selenium_worker

# Migrations
alembic upgrade head
alembic revision --autogenerate -m "msg"
```

### Testes
```bash
pytest                              # todos
pytest tests/unit                   # só unit (HTML mínimo)
pytest -m integration               # integração (HTML real)
pytest tests/unit/test_models.py::test_name   # teste único
```
Markers (`pytest.ini`): `unit`, `scraping`, `integration`.

### Frontend
```bash
cd promoly-next
npm run dev      # next dev
npm run build
npm run lint     # eslint
```

### Docker / pipeline
```bash
docker compose up api               # API na :8080, WAHA na :3000
./run_scrapping.sh                  # run do scraper com lock via docker compose
./run_selenium.sh                   # run do selenium com lock
```
Kill switch do pipeline: existência de `.pipeline_disabled` aborta `run_scrapping.sh` / `run_selenium.sh`. Ambos usam `flock` pra evitar execução concorrente.

## Convenções

- **Sufixo `_example`**: arquivos como `agent_config_example.json` são apenas templates. O sistema sempre carrega a versão **sem** o sufixo.
- Configuração via `.env` (`python-dotenv`). Vars principais: `DATABASE_URL`, `URL_MLB_BASE`, `SCRAPER_ENABLED_CATEGORIES`, `VITE_API_URL`, `ENVIRONMENT`, `LOG_LEVEL`.
- Categorias do scraper são adicionadas editando o dict `CATEGORIES` em `scrapper_mlb/config.py`, depois habilitando pela feature flag.
- Vários `.csv` e `*_debug.html` na raiz são artefatos/exports do scraper, não código-fonte.
