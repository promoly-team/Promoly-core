FROM python:3.12.3-slim

WORKDIR /app

# -----------------------------
# Dependências de sistema
# -----------------------------
RUN apt-get update && apt-get install -y \
    # build / python
    gcc \
    python3-dev \
    libxml2-dev \
    libxslt1-dev \
    \
 && rm -rf /var/lib/apt/lists/*

# -----------------------------
# Python deps
# -----------------------------
WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# -----------------------------
# App
# -----------------------------
COPY . .

# Selenium + Chrome no container precisam disso
ENV DISPLAY=:99

# ⚠️ importante: rodar como módulo
CMD ["python", "-m", "scrapper_mlb.main"]
