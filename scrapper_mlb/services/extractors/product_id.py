import re

def extract_product_id(link: str | None):
    if not link:
        return None

    match = re.search(r'MLB-?\d+', link)
    return match.group(0).replace('-', '') if match else None
