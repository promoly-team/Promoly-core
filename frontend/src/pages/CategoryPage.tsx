import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { fetchProducts, apiGet } from "../services/api";
import type { ProductCardData } from "../types";

const LIMIT = 12;

export default function CategoryPage() {
  const { slug } = useParams<{ slug?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get("page") || 1);
  const search = searchParams.get("search") || "";
  const order = searchParams.get("order") || "desconto";

  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    const offset = (page - 1) * LIMIT;

    Promise.all([
      fetchProducts({
        category: slug,
        search,
        order,
        limit: LIMIT,
        offset,
      }),
      apiGet<{ total: number }>(
        `/products/total?${new URLSearchParams({
          ...(slug ? { category: slug } : {}),
          ...(search ? { search } : {}),
        }).toString()}`
      ),
    ])
      .then(([list, totalRes]) => {
        // 🔥 Remove duplicados
        const unique = Array.from(
          new Map(list.map((p) => [p.produto_id, p])).values()
        );

        setProducts(unique);
        setTotal(totalRes.total);
      })
      .catch((err) => {
        console.error("Erro ao carregar categoria:", err);
        setProducts([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [slug, page, search, order]);

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-10">

        {/* ================= HEADER ================= */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">

          <div>
            <h1 className="text-3xl font-bold text-gray-900 capitalize">
              {slug ? slug : "Todas as ofertas"}
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              {total} produtos encontrados
            </p>
          </div>

          {/* CONTROLES */}
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">

            {/* BUSCA */}
            <input
              type="text"
              placeholder="Buscar produto..."
              value={search}
              onChange={(e) =>
                setSearchParams({
                  page: "1",
                  search: e.target.value,
                  order,
                })
              }
              className="
                w-full sm:w-64
                px-4 py-3
                bg-white
                border border-gray-200
                rounded-xl
                shadow-sm
                focus:outline-none
                focus:ring-2
                focus:ring-[#2563eb]
                focus:border-[#2563eb]
                transition
              "
            />

            {/* FILTRO */}
            <select
              value={order}
              onChange={(e) =>
                setSearchParams({
                  page: "1",
                  search,
                  order: e.target.value,
                })
              }
              className="
                px-4 py-3
                bg-white
                border border-gray-200
                rounded-xl
                shadow-sm
                focus:outline-none
                focus:ring-2
                focus:ring-[#2563eb]
                focus:border-[#2563eb]
                transition
              "
            >
              <option value="desconto">Maior desconto</option>
              <option value="preco">Menor preço</option>
              <option value="recentes">Mais recentes</option>
            </select>
          </div>
        </div>

        {/* ================= GRID ================= */}
        {loading ? (
          <p className="text-gray-500">Carregando...</p>
        ) : products.length === 0 ? (
          <p className="text-gray-500">Nenhum produto encontrado</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((p, index) => (
              <ProductCard
                key={`${p.produto_id}-${index}`} // 🔥 Key segura
                product={p}
              />
            ))}
          </div>
        )}

        {/* ================= PAGINAÇÃO ================= */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-12 flex-wrap">

            {Array.from({ length: totalPages }).map((_, i) => {
              const pageNumber = i + 1;
              const isActive = page === pageNumber;

              return (
                <button
                  key={i}
                  disabled={isActive}
                  onClick={() =>
                    setSearchParams({
                      page: String(pageNumber),
                      search,
                      order,
                    })
                  }
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition
                    ${
                      isActive
                        ? "bg-[#2563eb] text-white"
                        : "bg-white border border-gray-200 hover:bg-[#22c177] hover:text-white"
                    }
                  `}
                >
                  {pageNumber}
                </button>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
