def extract_description(item):
    el = item.find("a", class_="poly-component__title")
    return el.get_text(strip=False) if el else None
