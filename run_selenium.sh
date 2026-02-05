#!/bin/bash
set -e

LOCKFILE="/tmp/promoly_selenium.lock"

exec 9>"$LOCKFILE" || exit 1
flock -n 9 || {
  echo "[INFO] Selenium já está em execução. Abortando."
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

LOGFILE="/home/leandro/Documents/GitHub/Promoly-core/logs/selenium.log"
exec >> "$LOGFILE" 2>&1

echo "[$(date)] 🚀 Iniciando selenium"

source /home/leandro/Documents/env/bin/activate

export PROMOLY_DB_PATH=/home/leandro/Documents/GitHub/Promoly-core/data/promoly.db

python -m affiliate.selenium_worker

echo "[$(date)] ✅ Selenium finalizado com sucesso"