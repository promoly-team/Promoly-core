import CategoryHeroHighlight from "./components/CategoryHeroHighlight";
import CategoryLowestGrid from "./components/CategoryLowestGrid";
import { normalizeCategoryProduct } from "./utils/normalizeCategoryProduct";
import { buildCategoryLowestSchemas } from "./utils/categoryLowestSchemas";

type Props = {
  slug: string;
  products: any[];
  baseUrl: string;
};

export default function CategoryLowestPriceView({
  slug,
  products,
  baseUrl,
}: Props) {
  const sorted = [...products].sort((a, b) => a.diff_percent - b.diff_percent);

  const heroRaw = sorted[0];
  const hero = normalizeCategoryProduct(heroRaw);

  const categoriaNome = slug.charAt(0).toUpperCase() + slug.slice(1);

  const { breadcrumbSchema, itemListSchema } = buildCategoryLowestSchemas({
    baseUrl,
    slug,
    categoriaNome,
    products: sorted,
  });

  const today = new Date().toLocaleDateString("pt-BR");

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-14">
        <header className="mb-16">
          <h1 className="text-4xl font-bold mb-4">
            🔥 Menor preço em {categoriaNome} hoje
          </h1>
          <p className="text-gray-500">
            Produtos abaixo da média histórica. Atualizado em {today}
          </p>
        </header>

        <CategoryHeroHighlight product={hero} />

        <CategoryLowestGrid products={sorted} />
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
