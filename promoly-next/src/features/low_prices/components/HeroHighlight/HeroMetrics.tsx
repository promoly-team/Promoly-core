type Props = {
  product: any;
};

export default function HeroMetrics({ product }: Props) {
  return (
    <>
      <h3 className="text-lg font-semibold mb-4">{product.titulo}</h3>

      {/* PREÇO ATUAL */}
      <p className="text-4xl font-bold text-gray-900 mb-8">
        {product.currentPrice.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })}
      </p>

      <div className="grid grid-cols-2 gap-10 mb-10">
        {/* MÉDIA HISTÓRICA */}
        <div>
          <p className="text-xs text-muted uppercase mb-1">Média histórica</p>
          <p className="font-semibold text-lg">
            {product.avgPrice.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>
          <p className="text-success font-bold">
            {product.priceDiffPercent.toFixed(1)}% (
            {(product.currentPrice - product.avgPrice).toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
            )
          </p>
        </div>

        {/* ÚLTIMO PREÇO */}
        {product.lastPrice && (
          <div>
            <p className="text-xs text-muted uppercase mb-1">Último preço</p>
            <p className="font-semibold text-lg">
              {product.lastPrice.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>
            <p
              className={`font-bold ${
                product.variationVsLast > 0 ? "text-danger" : "text-success"
              }`}
            >
              {product.variationVsLast > 0 ? "+" : ""}
              {product.variationVsLast?.toFixed(1)}% (
              {(product.currentPrice - (product.lastPrice ?? 0)).toLocaleString(
                "pt-BR",
                {
                  style: "currency",
                  currency: "BRL",
                },
              )}
              )
            </p>
          </div>
        )}
      </div>
    </>
  );
}
