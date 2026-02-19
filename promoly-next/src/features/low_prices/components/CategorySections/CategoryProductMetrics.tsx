type Props = {
  product: any;
};

export default function CategoryProductMetrics({ product }: Props) {
  return (
    <>
      <h3 className="text-lg font-semibold mb-3">{product.titulo}</h3>

      <p className="text-3xl font-bold text-gray-900 mb-6">
        {product.currentPrice.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })}
      </p>

      <div className="grid grid-cols-2 gap-6 mb-6">
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
        {product.lastPrice !== null && (
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
              {product.variationVsLast.toFixed(1)}% (
              {(product.currentPrice - product.lastPrice).toLocaleString(
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

      {/* HISTÓRICO TEXTO */}
      <h4 className="text-base font-bold mb-2">Histórico de preço</h4>

      {product.variationVsLast !== null && (
        <p
          className={`text-sm mb-6 font-medium ${
            product.variationVsLast > 0 ? "text-danger" : "text-success"
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
