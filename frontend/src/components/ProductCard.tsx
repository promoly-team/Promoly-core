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
  return (
    <div className="product-card">
      {product.desconto_pct && (
        <span className="badge">-{product.desconto_pct}%</span>
      )}

      <div className="product-img">
        <img src={product.imagem_url} alt={product.titulo} />
      </div>

      <div className="product-content">
        <div className="product-title">{product.titulo}</div>

        <div className="price-row">
          <div className="price-info">
            {product.preco_anterior && (
              <span className="old-price">
                R$ {product.preco_anterior.toFixed(2)}
              </span>
            )}

            <span className="current-price">
              R$ {product.preco_atual.toFixed(2)}
            </span>
          </div>

          <a
            href={`/go/${product.produto_id}`}
            className="buy-btn"
            target="_blank"
            rel="noopener noreferrer"
          >
            Comprar
          </a>
        </div>
      </div>
    </div>
  );
}
