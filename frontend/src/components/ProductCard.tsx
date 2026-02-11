import { useEffect, useState } from "react";
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
  const id = window.location.pathname.split("/").pop();

  const [product, setProduct] = useState<Product | null>(null);
  const [similar, setSimilar] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    setLoading(true);

    fetch(`/api/produtos/${id}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data);
        return fetch(`/api/produtos/${data.id}/similares`);
      })
      .then(res => res.json())
      .then(setSimilar)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p>Carregando produto...</p>;
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

      <aside className="product-aside">
        <h3>Produtos semelhantes</h3>

        {similar.map(item => (
          <a
            key={item.id}
            href={`/produto/${item.id}`}
            className="similar-card"
          >
            <img src={item.imagem_url} alt={item.titulo} />
            <div>
              <p className="title">{item.titulo}</p>
              <span className="price">
                R$ {item.preco?.toFixed(2)}
              </span>
            </div>
          </a>
        ))}
      </aside>
    </div>
  );
}
