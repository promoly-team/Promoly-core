import ProductCard from "@/components/ProductCard";
import { fetchCategoryProducts, fetchCategoryTotal } from "@/lib/api";
import Link from "next/link";
import CategoryFilters from "@/components/category/CategoryFilters";
import type { Metadata } from "next";

const LIMIT = 12;

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://promoly-core.vercel.app";

/* =====================================================
   🔥 METADATA DINÂMICA
===================================================== */

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}): Promise<Metadata> {

  const { slug } = await params;
  const resolvedSearchParams = await searchParams;

  const page = resolvedSearchParams?.page;

  return {
    title: `${slug} – Ofertas e histórico de preços`,
    description: `Confira as melhores ofertas da categoria ${slug} e veja o histórico de preços antes de comprar.`,
    alternates: {
      canonical:
        page && page !== "1"
          ? `${BASE_URL}/categoria/${slug}?page=${page}`
          : `${BASE_URL}/categoria/${slug}`,
    },
  };
}


/* =====================================================
   🔥 PAGE
===================================================== */

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

  const products = await fetchCategoryProducts(slug, {
    limit: LIMIT,
    offset,
    search,
    order,
  });

  const { total } = await fetchCategoryTotal(slug, search);
  const totalPages = Math.ceil(total / LIMIT);

  /* =====================================================
     🔥 ITEMLIST
  ===================================================== */

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Produtos da categoria ${slug}`,
    itemListOrder: "https://schema.org/ItemListOrderDescending",
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Product",
        name: product.titulo,
        url: `${BASE_URL}/produto/${product.slug}-${product.produto_id}`,
        image: product.imagem_url,
        offers:
          "preco_atual" in product && product.preco_atual != null
            ? {
                "@type": "Offer",
                priceCurrency: "BRL",
                price: product.preco_atual.toFixed(2),
                availability: "https://schema.org/InStock",
              }
            : undefined,
      },
    })),
  };

  /* =====================================================
     🔥 BREADCRUMB
  ===================================================== */

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: BASE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: slug,
        item: `${BASE_URL}/categoria/${slug}`,
      },
    ],
  };

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* 🔥 STRUCTURED DATA */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(itemListSchema),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />

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
