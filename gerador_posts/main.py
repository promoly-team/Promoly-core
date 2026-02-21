from gerador_posts.downloader import baixar_imagens
from gerador_posts.removedor import remover_fundo
from gerador_posts.gerador_post import gerar_post


#somente para teste, proximo passo conectar com o banco
produtos = [
    {
        "id": 123,
        "nome": "Notebook Gamer",
        "preco": "R$ 3.999,00",
        "imagem_url": "https://http2.mlstatic.com/D_NQ_NP_2X_663249-MLA93829823661_092025-F.webp" 
    },
      {
        "id": 124,
        "nome": "Notebook Gamer",
        "preco": "R$ 3.999,00",
        "imagem_url": "https://http2.mlstatic.com/D_NQ_NP_2X_772553-MLA99501142436_112025-F.webp"
    },
      {
        "id": 125,
        "nome": "Notebook Gamer",
        "preco": "R$ 3.999,00",
        "imagem_url": "https://http2.mlstatic.com/D_NQ_NP_2X_820049-MLA99986777951_112025-F.webp"
    },
    {
        "id": 126,
        "nome": "Notebook Gamer",
        "preco": "R$ 3.999,00",
        "imagem_url": "https://http2.mlstatic.com/D_NQ_NP_2X_987227-MLB101508299488_122025-F-smartwatch-xiaomi-haylou-solar-lite-original-a-prova-dagua.webp"
    },
      {
        "id": 127,
        "nome": "Notebook Gamer",
        "preco": "R$ 3.999,00",
        "imagem_url": "https://http2.mlstatic.com/D_NQ_NP_2X_708355-MLA104788401199_012026-F.webp"
    },
      {
        "id": 128,
        "nome": "Notebook Gamer",
        "preco": "R$ 3.999,00",
        "imagem_url": "https://http2.mlstatic.com/D_NQ_NP_2X_953534-MLB105396384138_012026-F.webp"
    },
      {
        "id": 129,
        "nome": "Notebook Gamer",
        "preco": "R$ 3.999,00",
        "imagem_url": "https://http2.mlstatic.com/D_NQ_NP_2X_623762-MLB92532512261_092025-F-caderneta-anotaco-a5-executiva-tipo-moleskine-couro-sint.webp"
    },
      {
        "id": 130,
        "nome": "Notebook Gamer",
        "preco": "R$ 3.999,00",
        "imagem_url": "https://http2.mlstatic.com/D_NQ_NP_2X_645112-MLB95254274474_102025-F.webp"
    }
]

def processar_produtos(produtos):
    for produto in produtos:
            baixar_imagens(produtos)
            remover_fundo(produto)
            gerar_post(produto)

if __name__ == "__main__":
    produtos_processados = processar_produtos(produtos)
    print(produtos_processados)
