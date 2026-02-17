import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import { fetchProducts } from "@/lib/api";
import type { ProductCardData } from "@/types";

export default async function HomePage() {
  const products: ProductCardData[] = await fetchProducts({
    order: "desconto",
    limit: 20,
  });

  // 🔥 Remove duplicados (caso backend retorne repetidos)
  const unique = Array.from(
    new Map(products.map((p) => [p.produto_id, p])).values()
  );

  const categories = [
    { label: "Eletrônicos", slug: "eletronicos" },
    { label: "Casa", slug: "casa" },
    { label: "Pet", slug: "pet" },
    { label: "Games", slug: "games" },
    { label: "Fitness", slug: "fitness" },
    { label: "Automotivo", slug: "automotivo" },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-10">

        {/* 🔥 TOP 3 */}
        <div className="mb-14">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              🔥 Top ofertas de hoje
            </h2>

            <Link
              href="/ofertas"
              className="bg-[#22c177] hover:bg-[#1ea766] text-white text-sm font-semibold px-5 py-2 rounded-lg transition shadow-sm"
            >
              Ver todas →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {unique.slice(0, 3).map((p) => (
              <ProductCard
                key={`${p.produto_id}-top`}
                product={p}
              />
            ))}
          </div>
        </div>

        {/* CATEGORIAS */}
        <div className="flex flex-wrap gap-3 mb-12">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/categoria/${cat.slug}`}
              className="
                px-5 py-2
                bg-white
                text-gray-900
                rounded-full
                text-sm
                shadow-sm
                border border-yellow-600
                hover:bg-[#2563eb]
                hover:text-white
                hover:border-[#2563eb]
                transition
              "
            >
              {cat.label}
            </Link>
          ))}
        </div>

        {/* GRID PRINCIPAL */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold text-gray-800">
            Ofertas em destaque
          </h1>

          <Link
            href="/ofertas"
            className="
              group
              bg-[#2563eb]
              hover:bg-[#1d4ed8]
              text-white
              text-sm
              font-semibold
              px-5 py-2
              rounded-lg
              transition
              flex items-center gap-2
              shadow-sm
            "
          >
            Ver todas
            <span className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {unique.map((p) => (
            <ProductCard
              key={`${p.produto_id}-grid`}
              product={p}
            />
          ))}
        </div>

      </div>
    </div>
  );
}
