export type PurchaseDecision = {
  title: string;
  description: string;
  color: string;
  bg: string;
  icon: string;
};

export function getPurchaseDecision(diff: number): PurchaseDecision {
  if (diff <= -20) {
    return {
      title: "Excelente momento para comprar",
      description:
        "O preço está muito abaixo da média histórica. Forte indicação de oportunidade.",
      color: "text-success",
      bg: "bg-success/10 border-success/40",
      icon: "🟢",
    };
  }

  if (diff < -5) {
    return {
      title: "Bom momento para comprar",
      description: "O preço está abaixo da média histórica.",
      color: "text-success",
      bg: "bg-success/10 border-success/40",
      icon: "🟢",
    };
  }

  if (Math.abs(diff) <= 5) {
    return {
      title: "Preço dentro da média",
      description: "O preço está alinhado com a média histórica.",
      color: "text-accent",
      bg: "bg-accent/10 border-accent/40",
      icon: "🟡",
    };
  }

  return {
    title: "Momento desfavorável para compra",
    description: "O preço está acima da média histórica.",
    color: "text-danger",
    bg: "bg-danger/10 border-danger/40",
    icon: "🔴",
  };
}
