// Forma (loose) do produto vindo da API de menor-preço por categoria.
// Mistura campos crus (snake_case) e derivados usados no enrich/render.
export type CategoryProduct = {
  produto_id: number;
  slug: string;
  titulo: string;
  imagem_url?: string | null;
  url_afiliada?: string | null;

  // preços crus da API
  current_price?: number | null;
  avg_price?: number | null;
  min_price?: number | null;
  max_price?: number | null;
  previous_price?: number | null;
  diff_percent?: number | null;
  variation_vs_last?: number | null;

  // campos já enriquecidos / usados no grid
  preco_atual?: number | null;
  preco_anterior?: number | null;
  desconto_pct?: number | null;
  price_diff_percent?: number | null;

  history?: unknown[];
};
