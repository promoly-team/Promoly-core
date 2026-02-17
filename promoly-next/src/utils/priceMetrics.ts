export function calculatePriceMetrics(
  priceHistory: { preco: number }[]
) {
  if (priceHistory.length === 0) {
    return {
      maxPrice: 0,
      minPrice: 0,
      avgPrice: 0,
      currentPrice: 0,
      priceDiffPercent: 0,
      priceStatus: "no-data" as const,
      lowerDomain: 0,
      upperDomain: 0,
    };
  }

  const prices = priceHistory.map((p) => p.preco);

  const maxPrice = Math.max(...prices);
  const minPrice = Math.min(...prices);

  const avgPrice =
    prices.length > 1
      ? prices.reduce((a, b) => a + b, 0) / prices.length
      : prices[0];

  // Sempre o último elemento recebido
  const currentPrice = priceHistory[priceHistory.length - 1].preco;

  const priceDiffPercent =
    avgPrice > 0
      ? ((currentPrice - avgPrice) / avgPrice) * 100
      : 0;

  let priceStatus: "below" | "above" | "equal";

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
    priceDiffPercent,
    priceStatus,
    lowerDomain: Math.max(0, minPrice - padding),
    upperDomain: maxPrice + padding,
  };
}
