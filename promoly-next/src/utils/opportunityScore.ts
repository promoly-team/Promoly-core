export function calculateOpportunityScore(params: {
  priceDiffPercent?: number;   // % abaixo da média
  descontoPct?: number;        // desconto atual
  trend?: "alta" | "queda" | "estabilidade";
  historyLength?: number;
}) {
  const {
    priceDiffPercent = 0,
    descontoPct = 0,
    trend = "estabilidade",
    historyLength = 0,
  } = params;

  let score = 0;

  // 🔹 1. % abaixo da média (máx 40 pts)
  if (priceDiffPercent < 0) {
    score += Math.min(Math.abs(priceDiffPercent) * 2, 40);
  }

  // 🔹 2. Desconto atual (máx 30 pts)
  if (descontoPct > 0) {
    score += Math.min(descontoPct * 1.5, 30);
  }

  // 🔹 3. Tendência (máx 15 pts)
  if (trend === "queda") score += 15;
  if (trend === "alta") score -= 5;

  // 🔹 4. Histórico robusto (máx 15 pts)
  if (historyLength > 10) score += 15;
  else if (historyLength > 5) score += 8;

  return Math.max(0, Math.min(100, Math.round(score)));
}
