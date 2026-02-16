export function calculatePriceMetrics(
  priceHistory: { preco: number }[]
) {
  if (priceHistory.length === 0) {
    return {
      maxPrice: 0,
      minPrice: 0,
      avgPrice: 0,
      currentPrice: 0,
      priceStatus: "equal" as "below" | "above" | "equal",
      priceDiffPercent: 0,
      lowerDomain: 0,
      upperDomain: 0,
    };
  }

  const prices = priceHistory.map((p) => p.preco);

  const maxPrice = Math.max(...prices);
  const minPrice = Math.min(...prices);
  const avgPrice =
    prices.reduce((a, b) => a + b, 0) / prices.length;

  const currentPrice = prices[prices.length - 1];

  const priceDiffPercent =
    avgPrice > 0
      ? ((currentPrice - avgPrice) / avgPrice) * 100
      : 0;

  let priceStatus: "below" | "above" | "equal" = "equal";

  if (Math.abs(priceDiffPercent) < 0.5) {
    priceStatus = "equal";
  } else if (priceDiffPercent < 0) {
    priceStatus = "below";
  } else {
    priceStatus = "above";
  }

  const padding = Math.max(maxPrice * 0.05, 20);

  return {
    maxPrice,
    minPrice,
    avgPrice,
    currentPrice,
    priceStatus,
    priceDiffPercent,
    lowerDomain: Math.max(0, minPrice - padding),
    upperDomain: maxPrice + padding,
  };
}
