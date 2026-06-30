type Props = {
  analytics: {
    metrics: {
      currentPrice: number;
      avgPrice: number;
      minPrice: number;
      maxPrice: number;
      priceDiffPercent: number;
    };
    lastPrice: number | null;
    variationVsLast: number;
    diffVsLastValue: number;
    diffVsAverageValue: number;
    isLowestEver: boolean;
  };
  decision: {
    title: string;
    description: string;
    color: string;
    bg: string;
    icon: string;
  };
};

export default function ProductPriceAnalysis({ analytics, decision }: Props) {
  const {
    metrics,
    lastPrice,
    variationVsLast,
    diffVsLastValue,
    diffVsAverageValue,
    isLowestEver,
  } = analytics;

  const diff = metrics.priceDiffPercent;

  return (
    <div className="bg-[#0a154a] rounded-3xl border border-[#45C4B0] p-10 shadow-lg">
      <h2 className="text-2xl font-extrabold mb-6 text-[#9AEBA3]">
        💡 Análise inteligente de preço
      </h2>

      <p className="text-4xl font-extrabold text-[#F5F138] mb-8">
        {metrics.currentPrice.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })}
      </p>

      <div className="grid sm:grid-cols-2 gap-8 mb-10">
        {/* MÉDIA HISTÓRICA */}
        <div className="bg-[#000D34] rounded-2xl p-6 border border-[#45C4B0]">
          <p className="text-xs uppercase text-[#45C4B0] mb-2 font-semibold">
            Média histórica
          </p>

          <p className="font-bold text-lg text-[#9AEBA3]">
            {metrics.avgPrice.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>

          <p className="text-[#45C4B0] font-bold mt-2">
            {diff > 0 ? "+" : ""}
            {diff.toFixed(1)}% (
            {diffVsAverageValue.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
            )
          </p>
        </div>

        {/* ÚLTIMO PREÇO */}
        {lastPrice && (
          <div className="bg-[#000D34] rounded-2xl p-6 border border-[#45C4B0]">
            <p className="text-xs uppercase text-[#45C4B0] mb-2 font-semibold">
              Último preço registrado
            </p>

            <p className="font-bold text-lg text-[#9AEBA3]">
              {lastPrice.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>

            <p
              className={`font-bold mt-2 ${
                variationVsLast > 0
                  ? "text-[#F87171]" // vermelho suave
                  : "text-[#45C4B0]"
              }`}
            >
              {variationVsLast > 0 ? "+" : ""}
              {variationVsLast.toFixed(1)}% (
              {diffVsLastValue.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
              )
            </p>
          </div>
        )}
      </div>

      {/* BLOCO DECISÃO */}
      <div className="rounded-2xl p-6 border border-[#45C4B0] bg-[#000D34]">
        <p className="text-lg font-extrabold text-[#F5F138]">
          {decision.icon} {decision.title}
        </p>

        <p className="text-sm mt-3 text-[#45C4B0] font-semibold">
          {decision.description}
        </p>

        {variationVsLast > 0 && diff < 0 && (
          <p className="text-sm mt-3 font-semibold text-[#9AEBA3]">
            📈 O preço subiu recentemente, mas ainda permanece abaixo da média
            histórica.
          </p>
        )}

        {isLowestEver && (
          <p className="text-sm mt-3 font-bold text-[#45C4B0]">
            🎯 Este é o menor preço já registrado para este produto.
          </p>
        )}
      </div>
    </div>
  );
}
