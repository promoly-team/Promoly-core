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
    <div>
      <h2 className="text-lg sm:text-2xl font-bold mb-4 sm:mb-6 text-ink">
        💡 Análise inteligente de preço
      </h2>

      <p className="text-3xl sm:text-4xl font-extrabold text-ink mb-6">
        {metrics.currentPrice.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })}
      </p>

      <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* MÉDIA HISTÓRICA */}
        <div className="bg-panel-subtle rounded-2xl p-5 sm:p-6 border border-line">
          <p className="text-xs uppercase tracking-wide text-ink-faint mb-2">
            Média histórica
          </p>
          <p className="font-semibold text-lg text-ink">
            {metrics.avgPrice.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>
          <p className="text-success font-bold mt-2">
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
          <div className="bg-panel-subtle rounded-2xl p-5 sm:p-6 border border-line">
            <p className="text-xs uppercase tracking-wide text-ink-faint mb-2">
              Último preço registrado
            </p>
            <p className="font-semibold text-lg text-ink">
              {lastPrice.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>
            <p
              className={`font-bold mt-2 ${
                variationVsLast > 0 ? "text-danger" : "text-success"
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

      <div className={`rounded-2xl p-5 sm:p-6 border ${decision.bg}`}>
        <p className={`text-lg font-bold ${decision.color}`}>
          {decision.icon} {decision.title}
        </p>

        <p className="text-sm mt-3 text-ink-muted">{decision.description}</p>

        {variationVsLast > 0 && diff < 0 && (
          <p className="text-sm mt-3 font-medium text-ink">
            📈 O preço subiu recentemente, mas ainda permanece abaixo da média
            histórica.
          </p>
        )}

        {isLowestEver && (
          <p className="text-sm mt-3 font-semibold text-success">
            🎯 Este é o menor preço já registrado para este produto.
          </p>
        )}
      </div>
    </div>
  );
}
