from typing import Optional


def calculate_discount(
    preco_atual: Optional[float],
    preco_anterior: Optional[float],
) -> Optional[float]:
    """
    Calcula percentual de desconto.
    
    Regra:
    - Se não houver preço anterior → None
    - Se preço anterior <= preço atual → None
    - Caso contrário → percentual com 2 casas decimais
    """

    if (
        preco_atual is None
        or preco_anterior is None
        or preco_anterior <= preco_atual
    ):
        return None

    desconto = (preco_anterior - preco_atual) * 100 / preco_anterior

    return round(desconto, 2)
