def extract_shipping(item):
    promise = item.select_one(
        ".poly-component__shipping .poly-shipping--promise_day"
    )
    extra = item.select_one(
        ".poly-component__shipping .poly-shipping__additional_text"
    )

    if not promise:
        return None

    text = promise.get_text(strip=True)

    if extra:
        text += f" ({extra.get_text(strip=True)})"

    return text
