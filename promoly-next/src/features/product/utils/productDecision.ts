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
      bg: "bg-success-light border-success",
      icon: "🟢",
    };
  }

  if (diff < -5) {
    return {
      title: "Bom momento para comprar",
      description: "O preço está abaixo da média histórica.",
      color: "text-success",
      bg: "bg-success-light border-success",
      icon: "🟢",
    };
  }

  if (Math.abs(diff) <= 5) {
    return {
      title: "Preço dentro da média",
      description: "O preço está alinhado com a média histórica.",
      color: "text-gray-700",
      bg: "bg-gray-100 border-gray-300",
      icon: "🟡",
    };
  }

  return {
    title: "Momento desfavorável para compra",
    description: "O preço está acima da média histórica.",
    color: "text-danger",
    bg: "bg-red-50 border-danger",
    icon: "🔴",
  };
}
