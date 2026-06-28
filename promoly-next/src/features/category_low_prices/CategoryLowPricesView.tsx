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
    <div className="bg-base min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <header className="mb-12 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-ink">
            🔥 Menor preço em {categoriaNome} hoje
          </h1>
          <p className="text-ink-muted">
            Produtos abaixo da média histórica. Atualizado em {today}
          </p>
        </header>

        {/* HERO vindo da page (igual à principal) */}
        <CategoryHeroHighlight product={heroProduct} />

        {/* GRID usando enriched já tratado */}
        <CategoryLowestGrid products={enriched} />
      </div>

      {/* SCHEMAS */}
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
