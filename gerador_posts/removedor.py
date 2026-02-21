from rembg import remove # biblioteca para remover o fundo
from PIL import Image
import os


def remover_fundo(produto, pasta_saida="../promoly-core/gerador_posts/imagens_sem_fundo"):
    os.makedirs(pasta_saida, exist_ok=True)

    img_path = produto["imagem_local"]

    input_image = Image.open(img_path)# Abrir imagem original 
    output_image = remove(input_image)# Remover fundo

  # cria novo nome baseado no original
    nome_arquivo = os.path.basename(img_path)
    nome_base, _ = os.path.splitext(nome_arquivo)

    novo_caminho = os.path.join(pasta_saida, f"{nome_base}_sem_fundo.png")

    # Salvar imagem com fundo transparente
    output_image.save(novo_caminho)

    produto["imagem_sem_fundo"] = novo_caminho

    print(f"✔ Fundo removido: {novo_caminho}")
    
    return produto