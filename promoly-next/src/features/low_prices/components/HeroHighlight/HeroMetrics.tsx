type Props = {
  product: any;
};

export default function HeroMetrics({ product }: Props) {
  if (!product) return null;

  // 🔹 Mapear campos do backend (português → padrão interno)
  const currentPrice =
    typeof product.preco_atual === "number"
      ? product.preco_atual
      : (product.currentPrice ?? 0);

  const previousPrice =
    typeof product.preco_anterior === "number"
      ? product.preco_anterior
      : (product.previousPrice ?? null);

  const discountPercent =
    typeof product.desconto_pct === "number"
      ? product.desconto_pct
      : (product.discountPercent ?? 0);

  // 🔹 Média histórica (fallback)
  const avgPrice =
    typeof product.avgPrice === "number"
      ? product.avgPrice
      : (previousPrice ?? 0);

  const lastPrice =
    typeof product.lastPrice === "number" ? product.lastPrice : null;

  // 🔹 Diferença vs média
  const priceDiffPercent =
    avgPrice > 0 ? ((currentPrice - avgPrice) / avgPrice) * 100 : 0;

  // 🔹 Variação vs último preço
  const variationVsLast =
    lastPrice && lastPrice > 0
      ? ((currentPrice - lastPrice) / lastPrice) * 100
      : 0;

  const formatCurrency = (value: number) =>
    value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  return (
    <>
      <h3 className="text-base sm:text-lg font-semibold mb-2 leading-snug">
        {product.titulo}
      </h3>

      {/* PREÇO ATUAL */}
      <p className="text-2xl sm:text-4xl font-bold text-gray-900 mb-4 sm:mb-8">
        {formatCurrency(currentPrice)}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 mb-6 sm:mb-10">
        {/* MÉDIA HISTÓRICA */}
        <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
          <p className="text-[10px] sm:text-xs text-muted uppercase mb-1">
            Média histórica
          </p>

          <p className="font-semibold text-base sm:text-lg">
            {formatCurrency(avgPrice)}
          </p>

          <p
            className={`font-bold text-sm sm:text-base ${
              priceDiffPercent > 0 ? "text-danger" : "text-success"
            }`}
          >
            {priceDiffPercent > 0 ? "+" : ""}
            {priceDiffPercent.toFixed(1)}% (
            {formatCurrency(currentPrice - avgPrice)})
          </p>
        </div>

        {/* ÚLTIMO PREÇO */}
        {lastPrice && (
          <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
            <p className="text-[10px] sm:text-xs text-muted uppercase mb-1">
              Último preço
            </p>

            <p className="font-semibold text-base sm:text-lg">
              {formatCurrency(lastPrice)}
            </p>

            <p
              className={`font-bold text-sm sm:text-base ${
                variationVsLast > 0 ? "text-danger" : "text-success"
              }`}
            >
              {variationVsLast > 0 ? "+" : ""}
              {variationVsLast.toFixed(1)}% (
              {formatCurrency(currentPrice - lastPrice)})
            </p>
          </div>
        )}
      </div>
    </>
  );
}
