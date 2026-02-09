import "./ProductCard.css";
import { goToProduct } from "../services/api";


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
  const hasDiscount =
    product.preco_anterior &&
    product.preco_anterior > product.preco_atual;

  return (
    <div className="product-card" style={{ position: "relative" }}>
      {/* Badge de desconto */}
      {product.desconto_pct && (
        <span className="badge">-{product.desconto_pct}%</span>
      )}

      {/* Imagem */}
      <div className="product-img">
        <img
          src={product.imagem_url}
          alt={product.titulo}
          loading="lazy"
        />
      </div>

      {/* Conteúdo */}
      <div className="product-content">
        <div className="product-title">{product.titulo}</div>

        {/* Economia */}
        {hasDiscount && (
          <div className="economy">
            Economize R${" "}
            {(product.preco_anterior! - product.preco_atual).toFixed(2)}
          </div>
        )}

        {/* Preço + botão */}
        <div className="price-row">
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
