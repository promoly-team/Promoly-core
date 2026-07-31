import { describe, it, expect } from "vitest";
import { evaluatePromotion } from "../antiFakePromotion";

describe("evaluatePromotion", () => {
  it("classifica promoção forte e real", () => {
    const r = evaluatePromotion({
      currentPrice: 70,
      previousPrice: 100,
      avgPrice: 100,
      lastPrice: 100,
      discountPercent: 30,
      priceHistory: Array(30).fill(100),
    });
    expect(r.level).toBe("strong");
    expect(r.isRealDeal).toBe(true);
    expect(r.confidence).toBe("high");
  });

  it("sinaliza desconto inflado", () => {
    const r = evaluatePromotion({
      currentPrice: 95,
      previousPrice: 100,
      discountPercent: 50,
    });
    expect(r.flags).toContain("Desconto informado pode estar inflado");
  });

  it("detecta aumento artificial antes da promoção", () => {
    const r = evaluatePromotion({
      currentPrice: 90,
      avgPrice: 100,
      lastPrice: 140,
    });
    expect(r.flags).toContain("Possível aumento artificial antes da promoção");
  });

  it("detecta oscilação artificial", () => {
    const r = evaluatePromotion({
      currentPrice: 80,
      priceHistory: [100, 60, 100, 60, 100],
    });
    expect(r.flags).toContain("Padrão de oscilação artificial detectado");
  });

  it("trata entrada vazia sem quebrar", () => {
    const r = evaluatePromotion({ currentPrice: 0 });
    expect(r.score).toBe(0);
    expect(r.level).toBe("fake");
    expect(r.confidence).toBe("low");
  });

  it("confiança média com histórico moderado", () => {
    const r = evaluatePromotion({
      currentPrice: 80,
      priceHistory: Array(10).fill(100),
    });
    expect(r.confidence).toBe("medium");
  });
});
