type Props = {
  product: any;
};

export default function CategoryProductMetrics({ product }: Props) {
  const formatCurrency = (value: number) =>
    value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  return (
    <>
      {/* TÍTULO */}
      <h3 className="text-xl font-semibold text-[#9AEBA3] mb-4 leading-snug">
        {product.titulo}
      </h3>

      {/* PREÇO ATUAL */}
      <p className="text-4xl font-extrabold text-[#F5F138] mb-8">
        {formatCurrency(product.currentPrice)}
      </p>

      {/* MÉTRICAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        {/* MÉDIA HISTÓRICA */}
        <div className="bg-[#0a154a] border border-[#45C4B0] rounded-xl p-5">
          <p className="text-xs text-[#45C4B0] uppercase mb-2 tracking-wide">
            Média histórica
          </p>

          <p className="font-semibold text-lg text-[#9AEBA3]">
            {formatCurrency(product.avgPrice)}
          </p>

          <p
            className={`font-bold text-base ${
              product.priceDiffPercent > 0 ? "text-red-400" : "text-[#F5F138]"
            }`}
          >
            {product.priceDiffPercent > 0 ? "+" : ""}
            {product.priceDiffPercent.toFixed(1)}% (
            {formatCurrency(product.currentPrice - product.avgPrice)})
          </p>
        </div>

        {/* ÚLTIMO PREÇO */}
        {product.lastPrice !== null && (
          <div className="bg-[#0a154a] border border-[#45C4B0] rounded-xl p-5">
            <p className="text-xs text-[#45C4B0] uppercase mb-2 tracking-wide">
              Último preço
            </p>

            <p className="font-semibold text-lg text-[#9AEBA3]">
              {formatCurrency(product.lastPrice)}
            </p>

            <p
              className={`font-bold text-base ${
                product.variationVsLast > 0 ? "text-red-400" : "text-[#F5F138]"
              }`}
            >
              {product.variationVsLast > 0 ? "+" : ""}
              {product.variationVsLast.toFixed(1)}% (
              {formatCurrency(product.currentPrice - product.lastPrice)})
            </p>
          </div>
        )}
      </div>

      {/* HISTÓRICO TEXTO */}
      <h4 className="text-lg font-bold text-[#9AEBA3] mb-3">
        Histórico de preço
      </h4>

      {product.variationVsLast !== null && (
        <p
          className={`text-base font-semibold ${
            product.variationVsLast > 0 ? "text-red-400" : "text-[#F5F138]"
          }`}
        >
          {product.variationVsLast > 0 ? "⬆" : "⬇"}{" "}
          {Math.abs(product.variationVsLast).toFixed(1)}% (
          {Math.abs(
            product.currentPrice - (product.lastPrice ?? 0),
          ).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
          ) comparado ao último registro
        </p>
      )}
    </>
  );
}
