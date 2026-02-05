#!/bin/bash
set -e

LOCKFILE="/tmp/promoly_scraping.lock"

exec 9>"$LOCKFILE" || exit 1
flock -n 9 || {
  echo "[INFO] Scraping já está em execução. Abortando."
  exit 0
}

cd /home/leandro/Documents/GitHub/Promoly-core

# flag global de desligamento
if [ -f .pipeline_disabled ]; then
  echo "[INFO] Pipeline desativado"
  exit 0
fi

# garante diretório de logs
mkdir -p logs

LOGFILE="/home/leandro/Documents/GitHub/Promoly-core/logs/scraping.log"
exec >> "$LOGFILE" 2>&1

echo "[$(date)] 🚀 Iniciando scraping"

docker compose run --rm scraper

echo "[$(date)] ✅ Scraping finalizado com sucesso"
