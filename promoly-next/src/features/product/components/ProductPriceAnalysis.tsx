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
    <div className="bg-white rounded-3xl shadow-soft border border-gray-200 p-10">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">
        💡 Análise inteligente de preço
      </h2>

      <p className="text-4xl font-bold text-gray-900 mb-6">
        {metrics.currentPrice.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })}
      </p>

      <div className="grid sm:grid-cols-2 gap-8 mb-8">
        {/* MÉDIA HISTÓRICA */}
        <div className="bg-surface-subtle rounded-2xl p-6 border border-gray-200">
          <p className="text-xs uppercase text-muted mb-2">Média histórica</p>
          <p className="font-semibold text-lg">
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
          <div className="bg-surface-subtle rounded-2xl p-6 border border-gray-200">
            <p className="text-xs uppercase text-muted mb-2">
              Último preço registrado
            </p>
            <p className="font-semibold text-lg">
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

      <div className={`rounded-2xl p-6 border ${decision.bg}`}>
        <p className={`text-lg font-bold ${decision.color}`}>
          {decision.icon} {decision.title}
        </p>

        <p className="text-sm mt-3 text-gray-700">{decision.description}</p>

        {variationVsLast > 0 && diff < 0 && (
          <p className="text-sm mt-3 font-medium text-gray-800">
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
