import type { CategoryProduct } from "../types";

export function normalizeCategoryProduct(p: CategoryProduct) {
  return {
    produto_id: p.produto_id,
    slug: p.slug,
    titulo: p.titulo,
    imagem_url: p.imagem_url,
    url_afiliada: p.url_afiliada,

    currentPrice: p.current_price,
    avgPrice: p.avg_price,
    minPrice: p.min_price,
    maxPrice: p.max_price,
    lastPrice: p.previous_price,
    priceDiffPercent: p.diff_percent,
    variationVsLast: p.variation_vs_last,

    history: p.history ?? [],
    // 👇 domínio pro gráfico
    lowerDomain: (p.min_price ?? 0) * 0.9,
    upperDomain: (p.max_price ?? 0) * 1.1,
  };
}
