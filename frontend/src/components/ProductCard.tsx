import "./ProductCard.css";
import type { ProductCardData, Deal } from "../types";

const formatBRL = (v: number) =>
  v.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

const isDeal = (data: ProductCardData): data is Deal =>
  "preco_atual" in data;

export function ProductCard({ data }: { data: ProductCardData }) {
  const economia =
    isDeal(data) ? data.preco_anterior - data.preco_atual : 0;

  return (
    <div className="product-card">
      {isDeal(data) && (
        <div className="badge">
          🔥 {data.desconto_pct}% OFF
        </div>
      )}

      <div className="product-img">
        <img src={data.imagem_url} alt={data.titulo} />
      </div>

      <div className="product-content">
        <h3 className="product-title" title={data.titulo}>
          {data.titulo}
        </h3>

        {isDeal(data) && (
          <div className="economy">
            Economize {formatBRL(economia)}
          </div>
        )}

        <div className="price-row">
          <div className="price-info">
            {isDeal(data) ? (
              <>
                <span className="old-price">
                  {formatBRL(data.preco_anterior)}
                </span>
                <span className="current-price">
                  {formatBRL(data.preco_atual)}
                </span>
              </>
            ) : (
              <span className="current-price">
                {data.preco !== null
                  ? formatBRL(data.preco)
                  : "Preço indisponível"}
              </span>
            )}
          </div>

          <a
            className="buy-btn"
            href={data.url_afiliada}
            target="_blank"
            rel="noopener noreferrer"
          >
            Ver oferta
          </a>
        </div>
      </div>
    </div>
  );
}
