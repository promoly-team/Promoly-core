from models import Product
from services.extractors.description import extract_description
from services.extractors.link import extract_link
from services.extractors.product_id import extract_product_id
from services.extractors.price import extract_price
from services.extractors.rating import extract_rating
from services.extractors.image import extract_image

def build_product(item):
    link = extract_link(item)

    return Product(
        id_produto=extract_product_id(link),
        descricao=extract_description(item),
        preco=extract_price(item),
        avaliacao=extract_rating(item),
        desconto=None,
        link=link,
        imagem_url=extract_image(item)
    )
