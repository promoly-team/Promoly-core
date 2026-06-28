import { describe, it, expect } from "vitest";
import { calculateOpportunityScore } from "../opportunityScore";

describe("calculateOpportunityScore", () => {
  it("retorna 0 com params vazios", () => {
    expect(calculateOpportunityScore({})).toBe(0);
  });

  it("pontua preço abaixo da média (cap 40)", () => {
    expect(calculateOpportunityScore({ priceDiffPercent: -50 })).toBe(40);
  });

  it("pontua desconto (cap 30)", () => {
    expect(calculateOpportunityScore({ descontoPct: 100 })).toBe(30);
  });

  it("soma tendência de queda", () => {
    expect(calculateOpportunityScore({ trend: "queda" })).toBe(15);
  });

  it("penaliza tendência de alta mas nunca negativo", () => {
    expect(calculateOpportunityScore({ trend: "alta" })).toBe(0);
  });

  it("bonifica histórico robusto", () => {
    expect(calculateOpportunityScore({ historyLength: 11 })).toBe(15);
    expect(calculateOpportunityScore({ historyLength: 6 })).toBe(8);
  });

  it("limita score em 100", () => {
    const score = calculateOpportunityScore({
      priceDiffPercent: -100,
      descontoPct: 100,
      trend: "queda",
      historyLength: 50,
    });
    expect(score).toBe(100);
  });
});
