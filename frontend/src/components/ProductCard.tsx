import "./ProductCard.css";
import { goToProduct } from "../services/api";
import { useNavigate } from "react-router-dom";
import type { ProductCardData } from "../types";

type Props = {
  product: ProductCardData;
};

export default function ProductCard({ product }: Props) {
  const navigate = useNavigate();

  const hasDiscount =
    "preco_anterior" in product &&
    product.preco_anterior > product.preco_atual;

  return (
    <div className="product-card">
      {"desconto_pct" in product && product.desconto_pct && (
        <span className="badge">-{product.desconto_pct}%</span>
      )}

      <div
        className="product-img clickable"
        onClick={() => navigate(`/produto/${product.slug}`)}
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
          onClick={() => navigate(`/produto/${product.slug}`)}
        >
          {product.titulo}
        </div>

        <div className="action-row">
          <button
            className="details-btn"
            onClick={() => navigate(`/produto/${product.slug}`)}
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
