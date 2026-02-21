type Props = {
  product: any;
};

export default function HeroMetrics({ product }: Props) {
  if (!product) return null;

  const currentPrice =
    typeof product.preco_atual === "number"
      ? product.preco_atual
      : (product.currentPrice ?? 0);

  const previousPrice =
    typeof product.preco_anterior === "number"
      ? product.preco_anterior
      : (product.previousPrice ?? null);

  const avgPrice =
    typeof product.avgPrice === "number"
      ? product.avgPrice
      : (previousPrice ?? 0);

  const lastPrice =
    typeof product.lastPrice === "number" ? product.lastPrice : null;

  const priceDiffPercent =
    avgPrice > 0 ? ((currentPrice - avgPrice) / avgPrice) * 100 : 0;

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
      {/* TÍTULO */}
      <h3 className="text-lg sm:text-xl font-semibold text-[#9AEBA3] mb-3 leading-snug">
        {product.titulo}
      </h3>

      {/* PREÇO ATUAL */}
      <p className="text-3xl sm:text-5xl font-extrabold text-[#F5F138] mb-8">
        {formatCurrency(currentPrice)}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
        {/* MÉDIA HISTÓRICA */}
        <div className="bg-[#0a154a] border border-[#45C4B0] rounded-xl p-5">
          <p className="text-xs text-[#45C4B0] uppercase mb-2 tracking-wide">
            Média histórica
          </p>

          <p className="font-semibold text-lg text-[#9AEBA3]">
            {formatCurrency(avgPrice)}
          </p>

          <p
            className={`font-bold text-base ${
              priceDiffPercent > 0 ? "text-red-400" : "text-[#F5F138]"
            }`}
          >
            {priceDiffPercent > 0 ? "+" : ""}
            {priceDiffPercent.toFixed(1)}% (
            {formatCurrency(currentPrice - avgPrice)})
          </p>
        </div>

        {/* ÚLTIMO PREÇO */}
        {lastPrice && (
          <div className="bg-[#0a154a] border border-[#45C4B0] rounded-xl p-5">
            <p className="text-xs text-[#45C4B0] uppercase mb-2 tracking-wide">
              Último preço
            </p>

            <p className="font-semibold text-lg text-[#9AEBA3]">
              {formatCurrency(lastPrice)}
            </p>

            <p
              className={`font-bold text-base ${
                variationVsLast > 0 ? "text-red-400" : "text-[#F5F138]"
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
