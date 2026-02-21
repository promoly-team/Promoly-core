import CategoryHeroHighlight from "./components/CategoryHeroHighlight";
import CategoryLowestGrid from "./components/CategoryLowestGrid";
import { buildCategoryLowestSchemas } from "./utils/categoryLowestSchemas";

type Props = {
  slug: string;
  enriched: any[];
  heroProduct: any;
  baseUrl: string;
};

export default function CategoryLowestPriceView({
  slug,
  enriched,
  heroProduct,
  baseUrl,
}: Props) {
  const categoriaNome = slug.charAt(0).toUpperCase() + slug.slice(1);

  const { breadcrumbSchema, itemListSchema } = buildCategoryLowestSchemas({
    baseUrl,
    slug,
    categoriaNome,
    products: enriched,
  });

  const today = new Date().toLocaleDateString("pt-BR");

  return (
    <div className="bg-[#000D34] min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* ================= HEADER ================= */}
        <header className="mb-20 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#9AEBA3] leading-tight mb-4">
            🔥 Menor preço em{" "}
            <span className="text-[#F5F138]">{categoriaNome}</span> hoje
          </h1>

          <p className="text-[#45C4B0] text-lg font-semibold">
            Produtos abaixo da média histórica. Atualizado em {today}
          </p>
        </header>

        {/* ================= HERO ================= */}
        <CategoryHeroHighlight product={heroProduct} />

        {/* ================= GRID ================= */}
        <div className="mt-20">
          <CategoryLowestGrid products={enriched} />
        </div>
      </div>

      {/* ================= SCHEMAS ================= */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(itemListSchema),
        }}
      />
    </div>
  );
}
