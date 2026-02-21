from PIL import Image, ImageDraw, ImageFont
import os

def gerar_post(produto,  pasta_saida="../promoly-core/gerador_posts/banners"):
    os.makedirs(pasta_saida, exist_ok=True)
    # Abrir imagem de fundo
    fundo = Image.open("../Promoly-core/gerador_posts/template.png").convert("RGBA")
    draw = ImageDraw.Draw(fundo)

    # Abrir imagem a ser inserida do produto
    produto_img = Image.open(produto["imagem_sem_fundo"]).convert("RGBA")
    produto_img = produto_img.resize((400, 400)) # define o tamanho dela

    """
        CENTRALIZANDO O PRODUTO
    """
    # Calcula posição central a partir do fundo
    x_produto = (fundo.width - produto_img.width) // 2
    y_produto = (fundo.height - produto_img.height) // 2

    # Cola a imagem do produto centralizado
    fundo.paste(produto_img, (x_produto, y_produto), produto_img)

    try:#define a fonte do texto
        font = ImageFont.truetype("arial.ttf", 40)
    except:
        font = ImageFont.load_default()

    texto = f'{produto["nome"]} - {produto["preco"]}' #texto a ser inserido


    """
        CENTRALIZANDO O TEXTO
    """
    # Mede o texto
    bbox = draw.textbbox((0, 0), texto, font=font)
    texto_largura = bbox[2] - bbox[0]
    #texto_altura = bbox[3] - bbox[1]

    # Centraliza com as medidas do fundo e a partir da imagem do produto
    x_texto  = (fundo.width - texto_largura) // 2
    y_texto = y_produto + produto_img.height + 20

    draw.text((x_texto , y_texto), texto, fill="white", font=font) # coloca o texto na imagem


    #draw.text((250, 600), "Notebook Gamer", fill="white", font=font)
    #draw.text((280, 630), "R$ 3.999,00", fill="yellow", font=font)


    # Salvar
    caminho_banner = f'../promoly-core/gerador_posts/banners/banner_{produto["id"]}.png'
    fundo.save(caminho_banner)

    produto["banner_path"] = caminho_banner

    return produto
