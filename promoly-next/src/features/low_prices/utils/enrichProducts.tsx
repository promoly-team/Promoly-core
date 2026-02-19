import type { ProductCardData } from "@/types";
import { calculatePriceMetrics } from "@/utils/priceMetrics";
import { fetchPricesBatch } from "@/lib/api";

type PricePoint = {
  preco: number;
  created_at: string;
};

function hasThreeConsecutiveDrops(history: PricePoint[]) {
  if (!history || history.length < 2) return false;

  const sorted = [...history].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );

  let consecutive = 0;

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].preco < sorted[i - 1].preco) {
      consecutive++;
      if (consecutive >= 3) return true;
    } else {
      consecutive = 0;
    }
  }

  return false;
}

export async function enrichProducts(products: ProductCardData[]) {
  if (!products.length) return [];

  // 🔥 1️⃣ Busca TODOS os históricos de uma vez
  const productIds = products.map((p) => p.produto_id);

  const allPrices = await fetchPricesBatch(productIds);

  // 🔥 2️⃣ Processa em memória (zero novas requisições)
  const enriched = products.map((product) => {
    const history = allPrices[product.produto_id];

    if (!history || history.length < 2) return null;

    const metrics = calculatePriceMetrics(history);

    if (metrics.priceDiffPercent > -2) return null;

    const sortedHistory = [...history].sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );

    const lastPrice =
      sortedHistory.length >= 2
        ? sortedHistory[sortedHistory.length - 2].preco
        : null;

    const variationVsLast = lastPrice
      ? ((metrics.currentPrice - lastPrice) / lastPrice) * 100
      : 0;

    const diffVsLastValue = lastPrice ? metrics.currentPrice - lastPrice : 0;

    const diffVsAverageValue = metrics.currentPrice - metrics.avgPrice;

    return {
      ...product,
      history,
      maxPrice: metrics.maxPrice,
      minPrice: metrics.minPrice,
      avgPrice: metrics.avgPrice,
      currentPrice: metrics.currentPrice,
      lastPrice,
      priceDiffPercent: metrics.priceDiffPercent,
      variationVsLast,
      diffVsAverageValue,
      diffVsLastValue,
      priceStatus: metrics.priceStatus,
      lowerDomain: metrics.lowerDomain,
      upperDomain: metrics.upperDomain,
      hasThreeDrops: hasThreeConsecutiveDrops(history),
    };
  });

  return enriched.filter((p): p is NonNullable<typeof p> => p !== null);
}
