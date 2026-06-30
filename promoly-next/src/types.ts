import type { PriceStatus } from "@/utils/priceMetrics";

/* ======================================================
   BASE
====================================================== */

export type BaseProduct = {
  produto_id: number;
  slug: string;
  titulo: string;
  imagem_url: string | null;
  url_afiliada: string | null;

  categoria_id?: number | null;
  categoria_slug?: string | null;
  categoria_nome?: string | null;
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


/* ======================================================
   PRICE HISTORY / ENRICHED (listagens com métricas)
====================================================== */

export type PricePoint = {
  preco: number;
  created_at: string;
};

export type EnrichedProduct = ProductCardData & {
  history: PricePoint[];
  maxPrice: number;
  minPrice: number;
  avgPrice: number;
  currentPrice: number;
  lastPrice: number | null;
  previousPrice?: number | null;
  priceDiffPercent: number;
  variationVsLast: number;
  diffVsAverageValue?: number;
  diffVsLastValue?: number;
  priceStatus?: PriceStatus;
  lowerDomain: number;
  upperDomain: number;
  hasThreeDrops?: boolean;
  opportunityScore?: number;
};


/* ======================================================
   RAW /products/with-metrics (snake_case da API)
====================================================== */

export type ProductWithMetricsRaw = BaseProduct & {
  current_price: number;
  avg_price: number;
  min_price: number;
  max_price: number;
  previous_price: number | null;
  diff_percent: number;
  variation_vs_last: number;
  history?: PricePoint[];
  preco_atual?: number | null;
};


/* ======================================================
   PRODUCT DETAIL DATA (página do produto)
====================================================== */

export type ProductDetailData = {
  produto: Product;
  similares: Product[];
};
