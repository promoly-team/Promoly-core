import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchProduct } from "../services/api";
import type { Product } from "../types";
import "./ProductPage.css";

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();

  const [product, setProduct] = useState<Product | null>(null);
  const [similares, setSimilares] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    setLoading(true);

    fetchProduct(Number(id))
      .then(({ produto, similares }) => {
        setProduct(produto);
        setSimilares(similares);
      })
      .catch(err => {
        console.error(err);
        setError("Não foi possível carregar o produto");
      })
      .finally(() => setLoading(false));
  }, [id]);

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

        {product.preco !== null && (
          <div className="price">
            R$ {product.preco.toFixed(2)}
          </div>
        )}

        {product.descricao && (
          <p className="description">{product.descricao}</p>
        )}

        <a
          href={product.url_afiliada}
          target="_blank"
          rel="noopener noreferrer"
          className="buy-btn big"
        >
          Ver oferta
        </a>
      </section>

      {similares.length > 0 && (
        <aside className="product-aside">
          <h3>Produtos semelhantes</h3>
          {similares.map(p => (
            <a
              key={p.produto_id}
              href={`/produto/${p.produto_id}`}
              className="similar-item"
            >
              {p.titulo}
            </a>
          ))}
        </aside>
      )}
    </div>
  );
}
