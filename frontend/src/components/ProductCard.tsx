import "./ProductCard.css";
import { goToProduct } from "../services/api";
import { useNavigate } from "react-router-dom";
import type { ProductCardData } from "../types";

type Props = {
  product: ProductCardData;
};

export default function ProductCard({ product }: Props) {
  const navigate = useNavigate();

  const isDeal = "preco_atual" in product;

  return (
    <div className="product-card">
      {isDeal && product.desconto_pct && (
        <span className="badge">-{product.desconto_pct}%</span>
      )}

      <div
        className="product-img clickable"
        onClick={() => navigate(`/produto/${product.produto_id}`)}
      >
        <img
          src={product.imagem_url}
          alt={product.titulo}
          loading="lazy"
        />
      </div>

      <div className="product-content">
        <div
          className="product-title clickable"
          onClick={() => navigate(`/produto/${product.produto_id}`)}
        >
          {product.titulo}
        </div>

        <div className="price-info">
          {isDeal ? (
            <>
              {product.preco_anterior && (
                <span className="old-price">
                  R$ {product.preco_anterior.toFixed(2)}
                </span>
              )}
              <span className="current-price">
                R$ {product.preco_atual.toFixed(2)}
              </span>
            </>
          ) : (
            <span className="current-price">
              R$ {product.preco?.toFixed(2)}
            </span>
          )}
        </div>

        <div className="action-row">
          <button
            className="details-btn"
            onClick={() => navigate(`/produto/${product.produto_id}`)
}
          >
            Detalhes
          </button>

          <button
            className="buy-btn"
            onClick={() => goToProduct(product.produto_id)}
          >
            Ver Oferta
          </button>
        </div>
      </div>
    </div>
  );
}
