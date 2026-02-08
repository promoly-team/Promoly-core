import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { apiGet } from "../services/api";

const LIMIT = 12;

type Product = {
  produto_id: number;
  titulo: string;
  imagem_url: string;
  preco_atual: number;
  preco_anterior?: number | null;
  desconto_pct?: number | null;
};

export default function CategoryPage() {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get("page") || 1);
  const search = searchParams.get("search") || "";
  const order = searchParams.get("order") || "desconto";

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    setLoading(true);

    const offset = (page - 1) * LIMIT;

    Promise.all([
      apiGet<Product[]>(
        `/products?category=${slug}&search=${search}&order=${order}&limit=${LIMIT}&offset=${offset}`
      ),
      apiGet<{ total: number }>(
        `/products/total?category=${slug}&search=${search}`
      ),
    ])
      .then(([list, totalRes]) => {
        setProducts(list);
        setTotal(totalRes.total);
      })
      .catch(err => {
        console.error("Erro ao carregar produtos:", err);
        setProducts([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [slug, page, search, order]);

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="container">
      {/* ===== HEADER DA CATEGORIA ===== */}
      <div className="category-header">
        <h1 className="category-title">{slug}</h1>

        <div className="category-controls">
          <input
            className="search-input"
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

          <select
            className="order-select"
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
        </div>
      </div>

      {/* ===== CONTEÚDO ===== */}
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

      {/* ===== PAGINAÇÃO ===== */}
      {totalPages > 1 && (
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
      )}
    </div>
  );
}
