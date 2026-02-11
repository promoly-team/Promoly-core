import "./ProductCard.css";
import { goToProduct } from "../services/api";
import { useNavigate } from "react-router-dom";

type Product = {
  produto_id: number;
  titulo: string;
  imagem_url: string;
  preco_atual: number;
  preco_anterior?: number | null;
  desconto_pct?: number | null;
};

type Props = {
  product: Product;
};

export default function ProductCard({ product }: Props) {
  const navigate = useNavigate();

  const hasDiscount =
    product.preco_anterior &&
    product.preco_anterior > product.preco_atual;

  return (
    <div className="product-card" style={{ position: "relative" }}>
      {/* Badge de desconto */}
      {product.desconto_pct && (
        <span className="badge">-{product.desconto_pct}%</span>
      )}

      {/* Imagem (clicável → detalhes) */}
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

      {/* Conteúdo */}
      <div className="product-content">
        <div
          className="product-title clickable"
          onClick={() => navigate(`/produto/${product.produto_id}`)}
        >
          {product.titulo}
        </div>

        {/* Economia */}
        {hasDiscount && (
          <div className="economy">
            Economize R${" "}
            {(product.preco_anterior! - product.preco_atual).toFixed(2)}
          </div>
        )}

        {/* Preços */}
        <div className="price-info">
          {hasDiscount && (
            <span className="old-price">
              R$ {product.preco_anterior!.toFixed(2)}
            </span>
          )}

          <span className="current-price">
            R$ {product.preco_atual.toFixed(2)}
          </span>
        </div>

        {/* Ações */}
        <a
          href={`/produto/${product.slug}`}
          className="details-btn"
        >
          Detalhes
        </a>


          <button
            className="buy-btn"
            onClick={() => goToProduct(product.produto_id)}
          >
            Ver Oferta
          </button>
        </div>
      </div>
  );
}

      