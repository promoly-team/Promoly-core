def extract_link(item):
    el = item.select_one("a.poly-component__title")
    return el["href"] if el else None
