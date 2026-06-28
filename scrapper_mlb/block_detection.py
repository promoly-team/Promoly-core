"""Detecção unificada de página de bloqueio do Mercado Livre.

Antes a lógica vivia duplicada em dois lugares com markers diferentes:
- `http_client.is_blocked` (camada de listagem)
- `update_service.is_block_page` (camada de página de produto)

Aqui ficam os markers consolidados, num único ponto de manutenção.
"""

# Markers verificados como substring no HTML em minúsculas. Cobre tanto
# páginas antifraude (captcha/tráfego suspeito) quanto telas de verificação
# de conta. As classes CSS (.account-verification-header, .new-user-button)
# aparecem como texto no markup, então o match por substring as cobre.
BLOCK_MARKERS = [
    "captcha",
    "verify you are human",
    "access denied",
    "unusual traffic",
    "suspicious_traffic",
    "account-verification",
    "new-user-button",
    "olá! para continuar, acesse",
]


def is_blocked(html: str) -> bool:
    """True se o HTML parece uma página de bloqueio/verificação do ML."""
    html_lower = html.lower()
    return any(marker in html_lower for marker in BLOCK_MARKERS)
