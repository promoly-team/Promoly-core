import Highlight from "./components/HeroHighlight/index";
import CategorySection from "./components/CategorySections/index";
import FAQSection from "./components/FAQSection/index";

import { buildLowestPriceSchemas } from "./utils/lowestPriceSchema";

type EnrichedProduct = any;

type Props = {
  enriched: EnrichedProduct[];
  grouped: Record<
    string,
    {
      slug: string;
      items: EnrichedProduct[];
    }
  >;
  heroProduct: EnrichedProduct;
  baseUrl: string;
};

export default function LowPriceView({
  enriched,
  grouped,
  heroProduct,
  baseUrl,
}: Props) {
  const today = new Date().toLocaleDateString("pt-BR");

  const { faqSchema, itemListSchema } = buildLowestPriceSchemas(
    enriched,
    baseUrl,
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-14">
        {/* ================= HEADER ================= */}
        <header className="mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            🔥 Radar de Oportunidades – Produtos abaixo da média histórica
          </h1>
          <p className="text-gray-500">Atualizado em {today}</p>
        </header>

        {/* ================= HERO GLOBAL ================= */}
        <Highlight product={heroProduct} />

        {/* ================= CATEGORIAS ================= */}
        {Object.entries(grouped).map(([categoria, group]) => (
          <CategorySection
            key={categoria}
            categoria={categoria}
            group={group}
          />
        ))}
      </div>

      {/* ================= FAQ ================= */}
      <FAQSection />

      {/* ================= SCHEMAS ================= */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
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
