import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";

const LIMIT = 12;

export default function CategoryPage() {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get("page") || 1);
  const search = searchParams.get("search") || "";
  const order = searchParams.get("order") || "desconto";

  const [products, setProducts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    const offset = (page - 1) * LIMIT;

    Promise.all([
      fetch(
        `/products?category=${slug}&search=${search}&order=${order}&limit=${LIMIT}&offset=${offset}`
      ).then(r => r.json()),

      fetch(
        `/products/total?category=${slug}&search=${search}`
      ).then(r => r.json())
    ])
      .then(([list, totalRes]) => {
        setProducts(list);
        setTotal(totalRes.total);
      })
      .finally(() => setLoading(false));
  }, [slug, page, search, order]);

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="container">
      <h1>{slug}</h1>

      {/* 🔍 Search */}
      <input
        placeholder="Buscar produto..."
        value={search}
        onChange={e =>
          setSearchParams({
            page: "1",
            search: e.target.value,
            order,
          })
        }
      />

      {/* 🔽 Ordenação */}
      <select
        value={order}
        onChange={e =>
          setSearchParams({
            page: "1",
            search,
            order: e.target.value,
          })
        }
      >
        <option value="desconto">Maior desconto</option>
        <option value="preco">Menor preço</option>
        <option value="recentes">Mais recentes</option>
      </select>

      {loading ? (
        <p>Carregando...</p>
      ) : products.length === 0 ? (
        <p>Nenhum produto encontrado</p>
      ) : (
        <div className="cards-grid">
          {products.map(p => (
            <ProductCard key={p.produto_id} product={p} />
          ))}
        </div>
      )}

      {/* 📄 Paginação */}
      <div className="pagination">
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            disabled={page === i + 1}
            onClick={() =>
              setSearchParams({
                page: String(i + 1),
                search,
                order,
              })
            }
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
