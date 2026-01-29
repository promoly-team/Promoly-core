from decimal import Decimal, InvalidOperation


def normalize_price(price_str: str | None) -> Decimal | None:
    """
    Normaliza preço em formato BR para Decimal.

    Exemplos:
    - "199"       -> Decimal("199.00")
    - "199,90"    -> Decimal("199.90")
    - "1.299,90"  -> Decimal("1299.90")

    Retorna None se entrada for inválida.
    """

    if not price_str:
        return None

    try:
        normalized = (
            price_str
            .replace(".", "")   # remove separador de milhar
            .replace(",", ".")  # converte decimal BR para padrão Decimal
        )

        value = Decimal(normalized)

        # garante duas casas decimais
        return value.quantize(Decimal("0.00"))

    except (InvalidOperation, ValueError):
        return None
