from api.services.deal_service import DealService


class ContentService:

    def __init__(self, db):
        self.deal_service = DealService(db)

    # -------------------------------------------------
    # 🔥 Post individual de maior desconto
    # -------------------------------------------------

    def generate_top_deal_post(self):

        deals = self.deal_service.get_deals(limit=1)

        if not deals:
            return None

        deal = deals[0]

        preco_atual = deal.get("preco_atual")
        preco_anterior = deal.get("preco_anterior")
        desconto = deal.get("desconto_pct")

        if not preco_atual or not preco_anterior:
            return None

        economia = preco_anterior - preco_atual

        return f"""
🚨 OPORTUNIDADE REAL 🚨

{deal["titulo"]}

💰 Antes: R$ {preco_anterior:.2f}
🔥 Agora: R$ {preco_atual:.2f}

📉 Queda real de {desconto:.0f}% no último monitoramento
💸 Economia de R$ {economia:.2f}

⚠️ Produtos com esse padrão de queda
costumam voltar a subir rapidamente.

👉 Garanta agora:
{deal["url_afiliada"]}
"""

    # -------------------------------------------------
    # 📉 Post de menor preço histórico
    # -------------------------------------------------

    def generate_all_time_low_post(self):

        products = self.deal_service.get_all_time_low(limit=1)

        if not products:
            return None

        p = products[0]

        preco_atual = p.get("preco_atual")
        menor_preco = p.get("menor_preco_historico")

        if not preco_atual:
            return None

        return f"""
📉 MENOR PREÇO JÁ REGISTRADO 📉

{p["titulo"]}

💰 Apenas R$ {preco_atual:.2f}

Este é o menor valor histórico desde que começamos a monitorar.

Se você estava esperando o melhor momento…
⚠️ Esse pode ser ele.

👉 Confira agora:
{p["url_afiliada"]}
"""

    # -------------------------------------------------
    # 🏆 Lista Top 5 com economia real
    # -------------------------------------------------

    def generate_top5_post(self):

        deals = self.deal_service.get_deals(limit=5)

        if not deals:
            return None

        text = "🔥 TOP 5 OFERTAS COM MAIOR QUEDA HOJE 🔥\n\n"

        for i, deal in enumerate(deals, start=1):

            preco_atual = deal.get("preco_atual")
            preco_anterior = deal.get("preco_anterior")
            desconto = deal.get("desconto_pct")

            if not preco_atual or not desconto:
                continue

            economia = 0
            if preco_anterior:
                economia = preco_anterior - preco_atual

            text += (
                f"{i}. {deal['titulo']}\n"
                f"💰 R$ {preco_atual:.2f} "
                f"({desconto:.0f}% OFF)\n"
                f"💸 Economia de R$ {economia:.2f}\n\n"
            )

        text += "👉 Veja todas as ofertas antes que os preços reajustem!"

        return text
