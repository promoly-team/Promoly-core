from decimal import Decimal, InvalidOperation


def normalize_rating(value: str | None) -> Decimal | None:
    """
    Normaliza avaliação do produto.

    Exemplos:
    - "4.8" -> Decimal("4.8")
    - None  -> None
    """

    if not value:
        return None

    try:
        return Decimal(value)
    except (InvalidOperation, ValueError):
        return None
