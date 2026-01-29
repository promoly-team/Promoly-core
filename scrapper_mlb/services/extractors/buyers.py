import re

def extract_buyers(item):
    labels = item.select(
        ".poly-component__review-compacted .poly-phrase-label"
    )

    if len(labels) < 2:
        return None

    text = labels[1].get_text(strip=True)
    match = re.search(r"\+[\d\s\w]+", text)
    return match.group(0) if match else text
