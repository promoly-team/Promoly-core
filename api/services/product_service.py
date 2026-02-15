from sqlalchemy import text
from sqlalchemy.orm import Session

from api.utils.pricing import calculate_discount


class ProductService:
    """
    Camada de serviço responsável pelas regras de negócio
    relacionadas a produtos públicos.

    Esta classe centraliza:
    - Filtros
    - Ordenação
    - Construção de queries
    - Mapeamento de resultados
    - Regras de domínio (ex: cálculo de desconto)
    """

    def __init__(self, db: Session):
        self.db = db

    # =====================================================
    # TOTAL
    # =====================================================

    def count_products(
        self,
        category: str | None,
        search: str | None,
    ) -> int:
        """
        Retorna o total de produtos com base
        nos filtros opcionais.
        """

        query = """
            SELECT COUNT(DISTINCT p.id) AS total
            FROM produtos_publicos p
            JOIN produto_categoria pc ON pc.produto_id = p.id
            JOIN categorias c ON c.id = pc.categoria_id
        """

        params = {}
        conditions = []

        if category:
            conditions.append("c.slug = :category")
            params["category"] = category

        if search:
            conditions.append("LOWER(p.titulo) LIKE LOWER(:search)")
            params["search"] = f"%{search}%"

        if conditions:
            query += " WHERE " + " AND ".join(conditions)

        total = self.db.execute(text(query), params).scalar()

        return total or 0

    # =====================================================
    # LISTAGEM
    # =====================================================

    def list_products(
        self,
        category: str | None,
        search: str | None,
        order: str,
        limit: int,
        offset: int,
    ):
        """
        Retorna lista paginada de produtos
        com base nos filtros e ordenação.

        O cálculo de desconto é feito no domínio
        (Python), não mais no SQL.
        """

        query = """
            WITH precos AS (
                SELECT
                    produto_id,
                    preco,
                    ROW_NUMBER() OVER (
                        PARTITION BY produto_id
                        ORDER BY created_at DESC
                    ) AS rn
                FROM produto_preco_historico
            )
            SELECT
                p.id AS produto_id,
                p.titulo,
                p.imagem_url,
                p.url_afiliada,
                p.updated_at,
                u.preco AS preco_atual,
                a.preco AS preco_anterior
            FROM produtos_publicos p
            JOIN produto_categoria pc ON pc.produto_id = p.id
            JOIN categorias c ON c.id = pc.categoria_id
            JOIN precos u ON u.produto_id = p.id AND u.rn = 1
            LEFT JOIN precos a ON a.produto_id = p.id AND a.rn = 2
        """

        params = {"limit": limit, "offset": offset}
        conditions = []

        if category:
            conditions.append("c.slug = :category")
            params["category"] = category

        if search:
            conditions.append("LOWER(p.titulo) LIKE LOWER(:search)")
            params["search"] = f"%{search}%"

        if conditions:
            query += " WHERE " + " AND ".join(conditions)

        # -------------------------------------------------
        # Ordenação
        # -------------------------------------------------

        if order == "preco":
            order_by = "ORDER BY u.preco ASC NULLS LAST"
        elif order == "recentes":
            order_by = "ORDER BY p.updated_at DESC"
        else:
            # Ordenação padrão por desconto será feita
            # após o cálculo no Python
            order_by = "ORDER BY p.updated_at DESC"

        query += f"""
            {order_by}
            LIMIT :limit OFFSET :offset
        """

        rows = self.db.execute(text(query), params).mappings().all()

        # -------------------------------------------------
        # Mapeamento + cálculo de desconto (domínio)
        # -------------------------------------------------

        produtos = []

        for r in rows:
            preco_atual = (
                float(r["preco_atual"])
                if r["preco_atual"] is not None
                else None
            )

            preco_anterior = (
                float(r["preco_anterior"])
                if r["preco_anterior"] is not None
                else None
            )

            desconto = calculate_discount(
                preco_atual,
                preco_anterior,
            )

            produtos.append(
                {
                    "produto_id": r["produto_id"],
                    "titulo": r["titulo"],
                    "imagem_url": r["imagem_url"],
                    "preco_atual": preco_atual,
                    "preco_anterior": preco_anterior,
                    "desconto_pct": desconto,
                    "url_afiliada": r["url_afiliada"],
                    "_updated_at": r["updated_at"],  # auxiliar para ordenação
                }
            )

        # -------------------------------------------------
        # Ordenação por desconto (agora no Python)
        # -------------------------------------------------

        if order == "desconto":
            produtos.sort(
                key=lambda x: (
                    x["desconto_pct"] is None,
                    -(x["desconto_pct"] or 0),
                )
            )

        # Remove campo auxiliar
        for p in produtos:
            p.pop("_updated_at", None)

        return produtos

    # =====================================================
    # DETALHE
    # =====================================================

    def get_product_detail(self, product_id: int):
        """
        Retorna detalhes completos de um produto
        junto com similares.
        """

        result = self.db.execute(
            text("""
                SELECT
                    p.id AS produto_id,
                    p.slug,
                    p.titulo,
                    p.descricao,
                    p.imagem_url,
                    p.preco,
                    p.avaliacao,
                    p.url_afiliada,
                    COALESCE(
                        ARRAY_REMOVE(ARRAY_AGG(c.nome), NULL),
                        '{}'
                    ) AS categorias
                FROM produtos_publicos p
                LEFT JOIN produto_categoria pc ON pc.produto_id = p.id
                LEFT JOIN categorias c ON c.id = pc.categoria_id
                WHERE p.id = :product_id
                GROUP BY
                    p.id,
                    p.slug,
                    p.titulo,
                    p.descricao,
                    p.imagem_url,
                    p.preco,
                    p.avaliacao,
                    p.url_afiliada
            """),
            {"product_id": product_id}
        )

        produto = result.mappings().first()

        if not produto:
            return None

        produto_dict = dict(produto)
        similares = self._similares_por_categoria(product_id)

        return {
            "produto": produto_dict,
            "similares": [dict(s) for s in similares],
        }

    def get_product_by_slug(self, slug: str):
        """
        Busca produto pelo slug e reutiliza
        a lógica de detalhe já existente.
        """

        result = self.db.execute(
            text("""
                SELECT id
                FROM produtos_publicos
                WHERE slug = :slug
                LIMIT 1
            """),
            {"slug": slug}
        )

        row = result.first()

        if not row:
            return None

        product_id = row[0]

        return self.get_product_detail(product_id)


    # =====================================================
    # PRIVADOS
    # =====================================================

    def _similares_por_categoria(self, produto_id: int, limit=4):
        """
        Retorna produtos similares com base
        nas categorias em comum.
        """

        result = self.db.execute(
            text("""
                SELECT DISTINCT p.*
                FROM produtos_publicos p
                JOIN produto_categoria pc ON pc.produto_id = p.id
                WHERE pc.categoria_id IN (
                    SELECT categoria_id
                    FROM produto_categoria
                    WHERE produto_id = :produto_id
                )
                AND p.id != :produto_id
                LIMIT :limit
            """),
            {"produto_id": produto_id, "limit": limit}
        )

        return result.mappings().all()
