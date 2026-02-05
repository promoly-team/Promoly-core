import re


def normalize_discount(raw: str | None) -> int | None:
    if not raw:
        return None

    match = re.search(r"(\d+)", raw)
    return int(match.group(1)) if match else None
