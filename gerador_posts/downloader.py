import os
import requests



def baixar_imagens( produtos, pasta="../promoly-core/gerador_posts/imagens"): #lista com links das imagens
    os.makedirs(pasta, exist_ok=True) # Cria a pasta onde as imagens serão salvas

    headers = {
        "User-Agent": "Mozilla/5.0"
    }

    for produto in produtos:
        try:
            response = requests.get(produto["imagem_url"],headers=headers, timeout=15) # Faz o download da imagem
            response.raise_for_status() # lança erro: 404 (não encontrado) 403 (bloqueado) 500 (erro do servidor)

            content_type = response.headers.get("Content-Type", "")# verificação da tipo da imagem
            if "image/webp" in content_type:
                ext = "webp"
            elif "image/png" in content_type:
                ext = "png"
            elif "image" not in content_type:
                raise Exception("URL não retornou imagem válida")
            else:
                ext = "jpg"

            # Nome do arquivo baseado no ID do banco
            nome_arquivo = f'produto_{produto["id"]}.{ext}'
            caminho = os.path.join(pasta, nome_arquivo)

            with open(caminho, "wb") as f:
                f.write(response.content)

            # Associa o caminho salvo ao próprio objeto
            produto["imagem_local"] = caminho

            print(f'✔ Produto {produto["id"]} salvo em {caminho}')

        except Exception as e:
            print(f'❌ Erro no produto {produto["id"]}: {e}')
            produto["imagem_local"] = None












"""
from unittest.mock import Mock
from tweet_exporter import TweetExporter
import os


class TweetExporter:
    def __init__(self, conn):
            self.conn = conn

    def export_csv(self, path:str):
        with open(path, "w", encoding="utf-8") as f:
            self.conn.copy_expert(
                "
                    COPY (
                        SELECT
                            tp.tweet_text,
                            tp.produto_id,
                            p.imagem_url
                        FROM twitter_posts tp
                        JOIN produtos p
                            ON tp.produto_id = p.id
                        ORDER BY tp.created_at DESC
                    ) TO STDOUT WITH CSV HEADER
                ", f,
                )
            
print("CSV exportado com sucesso ✅")
   """