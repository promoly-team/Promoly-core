import ProductCard from "@/components/ProductCard";
import { fetchCategoryProducts, fetchCategoryTotal } from "@/lib/api";
import Link from "next/link";
import CategoryFilters from "@/components/category/CategoryFilters";
import type { Metadata } from "next";

const LIMIT = 12;

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://promoly-core.vercel.app";

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
    <div className="bg-[#000D34] min-h-screen">
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

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* ================= HERO HEADER ================= */}
        <header className="mb-16 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#9AEBA3] leading-tight">
            Ofertas em <span className="text-[#F5F138] capitalize">{slug}</span>
          </h1>

          <p className="text-[#45C4B0] mt-4 text-lg font-semibold">
            {total} produtos encontrados com histórico de preço
          </p>
        </header>

        {/* ================= FILTROS ================= */}
        <div className="mb-14">
          <CategoryFilters />
        </div>

        {/* ================= GRID ================= */}
        {products.length === 0 ? (
          <div className="text-center mt-20">
            <p className="text-[#45C4B0] text-lg font-semibold">
              Nenhum produto encontrado.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {products.map((p) => (
              <ProductCard key={p.produto_id} product={p} />
            ))}
          </div>
        )}

        {/* ================= PAGINAÇÃO ================= */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-4 mt-20 flex-wrap">
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
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition ${
                    isActive
                      ? "bg-[#F5F138] text-[#000D34] shadow-lg"
                      : "bg-[#0a154a] text-[#DAFDBA] border border-[#45C4B0] hover:bg-[#45C4B0] hover:text-[#000D34]"
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
