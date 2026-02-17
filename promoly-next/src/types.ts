/* ======================================================
   BASE
====================================================== */

export type BaseProduct = {
  produto_id: number;
  slug: string;            // 🔥 NÃO é mais null
  titulo: string;
  imagem_url: string | null;
  url_afiliada: string | null;
};


/* ======================================================
   DEAL (produto com desconto)
====================================================== */

export type Deal = BaseProduct & {
  preco_atual: number | null;
  preco_anterior: number | null;
  desconto_pct: number | null;
};


/* ======================================================
   OFFER (produto simples)
====================================================== */

export type Offer = BaseProduct & {
  preco: number | null;
};


/* ======================================================
   CARD DATA (usado na Home / listagens)
====================================================== */

export type ProductCardData = Deal | Offer;


/* ======================================================
   PRODUCT DETAIL (página do produto)
====================================================== */

export type Product = BaseProduct & {
  descricao?: string | null;
  preco: number | null;
  avaliacao?: number | null;
  categorias?: string[];
};
