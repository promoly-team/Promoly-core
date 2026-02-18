import { calculatePriceMetrics } from "@/utils/priceMetrics";

export type PricePoint = {
  preco: number;
  data: number;
};

export function buildProductAnalytics(priceHistory: PricePoint[]) {
  const metrics = calculatePriceMetrics(priceHistory);

  const lastPrice =
    priceHistory.length >= 2
      ? priceHistory[priceHistory.length - 2].preco
      : null;

  const variationVsLast = lastPrice
    ? ((metrics.currentPrice - lastPrice) / lastPrice) * 100
    : 0;

  const diffVsLastValue = lastPrice ? metrics.currentPrice - lastPrice : 0;

  const diffVsAverageValue = metrics.currentPrice - metrics.avgPrice;

  const isLowestEver = metrics.currentPrice <= metrics.minPrice;

  return {
    metrics,
    lastPrice,
    variationVsLast,
    diffVsLastValue,
    diffVsAverageValue,
    isLowestEver,
  };
}
