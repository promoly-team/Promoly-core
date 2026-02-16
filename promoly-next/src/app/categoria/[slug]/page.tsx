import ProductCard from "@/components/ProductCard";
import { fetchCategoryProducts, fetchCategoryTotal } from "@/lib/api";
import Link from "next/link";
import CategoryFilters from "@/components/category/CategoryFilters";

const LIMIT = 12;

export default async function CategoryPage(props: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    page?: string;
    search?: string;
    order?: string;
  }>;
}) {
  const { slug } = await props.params;
  const searchParams = await props.searchParams;

  const page = Number(searchParams?.page || 1);
  const search = searchParams?.search || "";
  const order = searchParams?.order || "desconto";

  const offset = (page - 1) * LIMIT;

  // 🔥 LISTAGEM
  const products = await fetchCategoryProducts(slug, {
    limit: LIMIT,
    offset,
    search,
    order,
  });

  // 🔥 CORREÇÃO AQUI (antes estava errado)
  const { total } = await fetchCategoryTotal(slug, search);

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-10">

        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 capitalize">
            {slug}
          </h1>

          <p className="text-sm text-gray-600 mt-1">
            {total} produtos encontrados
          </p>
        </div>

        {/* FILTROS */}
        <CategoryFilters />

        {/* GRID */}
        {products.length === 0 ? (
          <p className="text-gray-500 mt-6">
            Nenhum produto encontrado
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
            {products.map((p) => (
              <ProductCard
                key={p.produto_id}
                product={p}
              />
            ))}
          </div>
        )}

        {/* PAGINAÇÃO */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-12 flex-wrap">
            {Array.from({ length: totalPages }).map((_, i) => {
              const pageNumber = i + 1;
              const isActive = page === pageNumber;

              return (
                <Link
                  key={i}
                  href={{
                    pathname: `/categoria/${slug}`,
                    query: {
                      page: pageNumber,
                      search,
                      order,
                    },
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                    isActive
                      ? "bg-[#2563eb] text-white"
                      : "bg-white text-gray-800 border border-gray-300 hover:bg-[#22c177] hover:text-white"
                  }`}
                >
                  {pageNumber}
                </Link>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
