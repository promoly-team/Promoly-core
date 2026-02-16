export function calculatePriceMetrics(
  priceHistory: { preco: number }[]
) {
  if (priceHistory.length === 0) {
    return {
      maxPrice: 0,
      minPrice: 0,
      avgPrice: 0,
      currentPrice: 0,
      pricePosition: "stable" as "below" | "above" | "equal",
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

  const currentPrice = prices[prices.length - 1];

  let pricePosition: "below" | "above" | "equal" = "equal";

  if (currentPrice < avgPrice) pricePosition = "below";
  else if (currentPrice > avgPrice) pricePosition = "above";

  const padding = Math.max(maxPrice * 0.05, 20);

  return {
    maxPrice,
    minPrice,
    avgPrice,
    currentPrice,
    pricePosition,
    lowerDomain: Math.max(0, minPrice - padding),
    upperDomain: maxPrice + padding,
  };
}
