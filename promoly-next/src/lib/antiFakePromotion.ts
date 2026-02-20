export type PromotionInput = {
  currentPrice: number;
  previousPrice?: number | null;
  avgPrice?: number | null;
  lastPrice?: number | null;
  discountPercent?: number | null;
  priceHistory?: number[]; // 🔥 NOVO (opcional)
};

export type PromotionAnalysis = {
  score: number;
  level: "fake" | "weak" | "moderate" | "strong";
  isRealDeal: boolean;
  confidence: "low" | "medium" | "high";
  flags: string[];
};

export function evaluatePromotion(data: PromotionInput): PromotionAnalysis {
  const {
    currentPrice,
    previousPrice = null,
    avgPrice = null,
    lastPrice = null,
    discountPercent = 0,
    priceHistory = [],
  } = data;

  let score = 0;
  let maxPossibleScore = 0;
  const flags: string[] = [];

  /* =====================================================
     🔹 1. Média histórica
  ===================================================== */

  if (avgPrice && avgPrice > 0) {
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

  if (previousPrice && previousPrice > 0) {
    maxPossibleScore += 20;

    const realDiscount = ((previousPrice - currentPrice) / previousPrice) * 100;

    if (Math.abs(realDiscount - discountPercent) <= 5) {
      score += 20;
    } else {
      flags.push("Desconto informado pode estar inflado");
    }
  }

  /* =====================================================
     🔹 3. Pico artificial simples
  ===================================================== */

  if (avgPrice && lastPrice) {
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

  if (discountPercent >= 40) score += 15;
  else if (discountPercent >= 25) score += 10;
  else if (discountPercent >= 15) score += 5;
  else flags.push("Desconto pouco relevante");

  /* =====================================================
     🔹 5. Tendência vs último preço
  ===================================================== */

  if (lastPrice && lastPrice > 0) {
    maxPossibleScore += 15;

    const variation = ((currentPrice - lastPrice) / lastPrice) * 100;

    if (variation <= -15) score += 15;
    else if (variation <= -8) score += 8;
  }

  /* =====================================================
     🔥 6. DETECÇÃO DE OSCILAÇÃO ARTIFICIAL (NOVO)
  ===================================================== */

  let oscillationPenalty = 0;

  if (priceHistory.length >= 4) {
    let reversals = 0;

    for (let i = 2; i < priceHistory.length; i++) {
      const diff1 = priceHistory[i - 1] - priceHistory[i - 2];
      const diff2 = priceHistory[i] - priceHistory[i - 1];

      // Mudança de direção
      if (diff1 * diff2 < 0) {
        const variation =
          Math.abs(priceHistory[i] - priceHistory[i - 1]) / priceHistory[i - 1];

        if (variation > 0.2) {
          reversals++;
        }
      }
    }

    if (reversals >= 2) {
      oscillationPenalty = 30; // 🔥 Penalização forte
      flags.push("Padrão de oscilação artificial detectado");
    }
  }

  /* =====================================================
     🔹 Normalização
  ===================================================== */

  let normalizedScore =
    maxPossibleScore > 0 ? Math.round((score / maxPossibleScore) * 100) : 0;

  // Aplicar penalização após normalização
  normalizedScore = Math.max(0, normalizedScore - oscillationPenalty);

  /* =====================================================
     🔹 Classificação
  ===================================================== */

  let level: PromotionAnalysis["level"] = "fake";

  if (normalizedScore >= 75) level = "strong";
  else if (normalizedScore >= 55) level = "moderate";
  else if (normalizedScore >= 35) level = "weak";
  else level = "fake";

  /* =====================================================
     🔹 Confiança
  ===================================================== */

  let confidence: PromotionAnalysis["confidence"] = "low";

  const historySize = priceHistory.length;

  // 🔥 Confiança baseada na quantidade de registros
  if (historySize >= 30) confidence = "high";
  else if (historySize >= 10) confidence = "medium";
  else confidence = "low";

  return {
    score: normalizedScore,
    level,
    isRealDeal: level === "strong" || level === "moderate",
    confidence,
    flags,
  };
}
