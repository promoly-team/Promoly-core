from rembg import remove # biblioteca para remover o fundo
from PIL import Image, ImageDraw, ImageFont


# Abrir imagem original 
input_image = Image.open("D_Q_NP_2X_663249-MLA93829823661_092025-E.webp")

# Remover fundo
output_image = remove(input_image)

# Salvar imagem com fundo transparente
output_image.save("imagem_sem_fundo.png")