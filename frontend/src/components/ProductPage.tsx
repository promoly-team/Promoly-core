import { useParams } from "react-router-dom";
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

const id = window.location.pathname.split("/").pop();


export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [similar, setSimilar] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

    useEffect(() => {
    if (!id) return;

    fetch(`/api/produtos/${id}`)
        .then(res => res.json())
        .then(data => {
        setProduct(data);
        return fetch(`/api/produtos/${data.id}/similares`);
        })
        .then(res => res.json())
        .then(setSimilar);
    }, [id]);


  if (loading) return <p>Carregando produto...</p>;
  if (!product) return <p>Produto não encontrado.</p>;

  return (
    <div className="product-page">
      {/* SECTION */}
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

      {/* ASIDE */}
      <aside className="product-aside">
        <h3>Produtos semelhantes</h3>

        {similar.length === 0 && (
          <p className="empty">Nenhum produto parecido encontrado.</p>
        )}

        {similar.map(item => (
          <div
            key={item.id}
            className="similar-card"
            onClick={() => window.location.href = `/produto/${item.id}`}
          >
            <img src={item.imagem_url} alt={item.titulo} />
            <div>
              <p className="title">{item.titulo}</p>
              <span className="price">
                R$ {item.preco?.toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </aside>
    </div>
  );
}
