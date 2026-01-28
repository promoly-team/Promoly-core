def extract_rating(item):
    labels = item.select(
        ".poly-component__review-compacted .poly-phrase-label"
    )

    if not labels:
        return None

    return labels[0].get_text(strip=True)
