from scrapper_mlb.services.extractors.link import extract_link
from scrapper_mlb.services.extractors.rating import extract_rating
from scrapper_mlb.services.extractors.buyers import extract_buyers
from scrapper_mlb.services.extractors.shipping import extract_shipping

def build_product(item):
    return {
        'link': extract_link(item),
        'avaliacao': extract_rating(item),
        'compradores': extract_buyers(item),
        'frete': extract_shipping(item),
    }
