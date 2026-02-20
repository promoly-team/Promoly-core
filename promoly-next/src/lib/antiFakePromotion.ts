export type PromotionInput = {
  currentPrice: number;
  previousPrice?: number | null;
  avgPrice?: number | null;
  lastPrice?: number | null;
  discountPercent?: number | null;
  priceHistory?: number[] | null;
};

export type PromotionAnalysis = {
  score: number;
  level: "fake" | "weak" | "moderate" | "strong";
  isRealDeal: boolean;
  confidence: "low" | "medium" | "high";
  flags: string[];
};

export function evaluatePromotion(data: PromotionInput): PromotionAnalysis {
  // 🔒 Normalização segura de todos os valores numéricos
  const currentPrice = Number(data.currentPrice) || 0;
  const previousPrice = data.previousPrice ?? null;
  const avgPrice = data.avgPrice ?? null;
  const lastPrice = data.lastPrice ?? null;
  const safeDiscountPercent = data.discountPercent ?? 0;
  const priceHistory = data.priceHistory ?? [];

  let score = 0;
  let maxPossibleScore = 0;
  const flags: string[] = [];

  /* =====================================================
     🔹 1. Média histórica
  ===================================================== */

  if (avgPrice !== null && avgPrice > 0) {
    maxPossibleScore += 30;

    const diff = ((currentPrice - avgPrice) / avgPrice) * 100;

    if (diff <= -20) score += 30;
    else if (diff <= -10) score += 20;
    else if (diff <= -5) score += 10;
    else
      flags.push("Preço não está significativamente abaixo da média histórica");
  }

  /* =====================================================
     🔹 2. Consistência do desconto
  ===================================================== */

  if (previousPrice !== null && previousPrice > 0) {
    maxPossibleScore += 20;

    const realDiscount = ((previousPrice - currentPrice) / previousPrice) * 100;

    if (Math.abs(realDiscount - safeDiscountPercent) <= 5) {
      score += 20;
    } else {
      flags.push("Desconto informado pode estar inflado");
    }
  }

  /* =====================================================
     🔹 3. Pico artificial simples
  ===================================================== */

  if (avgPrice !== null && lastPrice !== null) {
    maxPossibleScore += 20;

    if (lastPrice > avgPrice * 1.3 && currentPrice <= avgPrice) {
      flags.push("Possível aumento artificial antes da promoção");
    } else {
      score += 20;
    }
  }

  /* =====================================================
     🔹 4. Desconto relevante
  ===================================================== */

  maxPossibleScore += 15;

  if (safeDiscountPercent >= 40) score += 15;
  else if (safeDiscountPercent >= 25) score += 10;
  else if (safeDiscountPercent >= 15) score += 5;
  else flags.push("Desconto pouco relevante");

  /* =====================================================
     🔹 5. Tendência vs último preço
  ===================================================== */

  if (lastPrice !== null && lastPrice > 0) {
    maxPossibleScore += 15;

    const variation = ((currentPrice - lastPrice) / lastPrice) * 100;

    if (variation <= -15) score += 15;
    else if (variation <= -8) score += 8;
  }

  /* =====================================================
     🔥 6. Oscilação artificial
  ===================================================== */

  let oscillationPenalty = 0;

  if (priceHistory.length >= 4) {
    let reversals = 0;

    for (let i = 2; i < priceHistory.length; i++) {
      const diff1 = priceHistory[i - 1] - priceHistory[i - 2];
      const diff2 = priceHistory[i] - priceHistory[i - 1];

      if (diff1 * diff2 < 0) {
        const variation =
          Math.abs(priceHistory[i] - priceHistory[i - 1]) / priceHistory[i - 1];

        if (variation > 0.2) reversals++;
      }
    }

    if (reversals >= 2) {
      oscillationPenalty = 30;
      flags.push("Padrão de oscilação artificial detectado");
    }
  }

  /* =====================================================
     🔹 Normalização
  ===================================================== */

  let normalizedScore =
    maxPossibleScore > 0 ? Math.round((score / maxPossibleScore) * 100) : 0;

  normalizedScore = Math.max(0, normalizedScore - oscillationPenalty);

  /* =====================================================
     🔹 Classificação
  ===================================================== */

  let level: PromotionAnalysis["level"] = "fake";

  if (normalizedScore >= 75) level = "strong";
  else if (normalizedScore >= 55) level = "moderate";
  else if (normalizedScore >= 35) level = "weak";

  /* =====================================================
     🔹 Confiança
  ===================================================== */

  let confidence: PromotionAnalysis["confidence"] = "low";

  if (priceHistory.length >= 30) confidence = "high";
  else if (priceHistory.length >= 10) confidence = "medium";

  return {
    score: normalizedScore,
    level,
    isRealDeal: level === "strong" || level === "moderate",
    confidence,
    flags,
  };
}
