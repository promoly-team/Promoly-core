from decimal import Decimal


def extract_page_rating(soup):
    tag = soup.select_one("span.ui-pdp-review__rating")

    if not tag:
        return None

    try:
        return Decimal(tag.text.strip())
    except:
        return None
