import re

def extract_image(item):
    img = item.find("img", class_="poly-component__picture")
    src = img.get("src") if img else None

    if src and not src.startswith("data:image"):
        return src

    match = re.search(
        r'https://http2\.mlstatic\.com/[^"\s]+\.webp',
        str(item)
    )
    return match.group(0) if match else None
