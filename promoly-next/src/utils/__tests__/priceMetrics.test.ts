import { describe, it, expect } from "vitest";
import { calculatePriceMetrics } from "../priceMetrics";

describe("calculatePriceMetrics", () => {
  it("retorna no-data para histórico vazio", () => {
    const m = calculatePriceMetrics([]);
    expect(m.priceStatus).toBe("no-data");
    expect(m.maxPrice).toBe(0);
  });

  it("calcula min/max/avg e current", () => {
    const m = calculatePriceMetrics([
      { preco: 100 },
      { preco: 200 },
      { preco: 150 },
    ]);
    expect(m.minPrice).toBe(100);
    expect(m.maxPrice).toBe(200);
    expect(m.avgPrice).toBeCloseTo(150);
    expect(m.currentPrice).toBe(150);
  });

  it("marca below quando preço atual abaixo da média", () => {
    const m = calculatePriceMetrics([
      { preco: 200 },
      { preco: 200 },
      { preco: 100 },
    ]);
    expect(m.priceStatus).toBe("below");
    expect(m.priceDiffPercent).toBeLessThan(0);
  });

  it("marca above quando preço atual acima da média", () => {
    const m = calculatePriceMetrics([
      { preco: 100 },
      { preco: 100 },
      { preco: 200 },
    ]);
    expect(m.priceStatus).toBe("above");
  });

  it("marca equal quando próximo da média", () => {
    const m = calculatePriceMetrics([{ preco: 100 }, { preco: 100 }]);
    expect(m.priceStatus).toBe("equal");
  });

  it("usa único valor quando histórico tem 1 item", () => {
    const m = calculatePriceMetrics([{ preco: 80 }]);
    expect(m.avgPrice).toBe(80);
    expect(m.currentPrice).toBe(80);
  });

  it("lowerDomain nunca é negativo", () => {
    const m = calculatePriceMetrics([{ preco: 10 }, { preco: 10 }]);
    expect(m.lowerDomain).toBeGreaterThanOrEqual(0);
  });
});
