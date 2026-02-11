import { useEffect, useState } from "react";
import { fetchProduct } from "../services/api";
import "./ProductPage.css";

type Product = {
  id: number;
  titulo: string;
  descricao?: string;
  imagem_url: string;
  preco: number;
  avaliacao?: number;
  link_original: string;
};

export default function ProductPage() {
  const productId = Number(
    window.location.pathname.split("/").pop()
  );

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) return;

    setLoading(true);

    fetchProduct(productId)
      .then(data => setProduct(data))
      .catch(err => {
        console.error(err);
        setError("Não foi possível carregar o produto");
      })
      .finally(() => setLoading(false));
  }, [productId]);

  if (loading) return <p>Carregando produto...</p>;
  if (error) return <p>{error}</p>;
  if (!product) return <p>Produto não encontrado.</p>;

  return (
    <div className="product-page">
      <section className="product-main">
        <img
          src={product.imagem_url}
          alt={product.titulo}
          className="product-image"
        />

        <h1>{product.titulo}</h1>

        {product.avaliacao && (
          <div className="rating">⭐ {product.avaliacao}</div>
        )}

        <div className="price">
          R$ {product.preco?.toFixed(2)}
        </div>

        {product.descricao && (
          <p className="description">{product.descricao}</p>
        )}

        <a
          href={product.link_original}
          target="_blank"
          rel="noopener noreferrer"
          className="buy-btn big"
        >
          Ver oferta
        </a>
      </section>
    </div>
  );
}
