from scrapper_mlb.models import Product
from scrapper_mlb.services.extractors.buyers import extract_buyers
from scrapper_mlb.services.extractors.description import extract_description
from scrapper_mlb.services.extractors.image import extract_image
from scrapper_mlb.services.extractors.link import extract_link
from scrapper_mlb.services.extractors.price import extract_price
from scrapper_mlb.services.extractors.product_id import extract_product_id
from scrapper_mlb.services.extractors.rating import extract_rating
from scrapper_mlb.services.normalizers.buyers import normalize_buyers
from scrapper_mlb.services.normalizers.price import normalize_price
from scrapper_mlb.services.normalizers.rating import normalize_rating


def build_product(item):
    link = extract_link(item)
    product_id = extract_product_id(link)

    if not link or not product_id:
        raise ValueError("Link ou ID do produto inválido")

    raw_price = extract_price(item)
    price = normalize_price(raw_price)

    if price is None:
        raise ValueError("Preço inválido")

    return Product(
        id_produto=product_id,
        descricao=extract_description(item),
        preco=price,                               # Decimal
        avaliacao=normalize_rating(
            extract_rating(item)
        ),                                         # Decimal | None
        desconto=None,
        link=link,
        imagem_url=extract_image(item),
        buyers=normalize_buyers(
            extract_buyers(item)
        ),                                         # int | None
    )
