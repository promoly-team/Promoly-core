import Highlight from "./components/HeroHighlight";
import CategorySection from "./components/CategorySections";
import FAQSection from "./components/FAQSection";

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-14">
        {/* ================= HEADER ================= */}
        <header className="mb-20">
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold leading-tight mb-3">
            🔥 Radar de Oportunidades – Produtos abaixo da média histórica
          </h1>
          <p className="text-gray-500 text-lg">Atualizado em {today}</p>
        </header>

        {/* ================= HERO GLOBAL ================= */}
        <section className="mb-24">
          <div className="bg-white rounded-2xl shadow border border-gray-200 p-4 sm:p-10">
            <Highlight product={heroProduct} />
          </div>
        </section>

        {/* ================= EXPLICAÇÃO SEO ================= */}
        <section className="max-w-3xl mx-auto mb-24">
          <div className="bg-white rounded-2xl shadow-soft border border-gray-200 p-10 text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="text-2xl bg-primary/10 rounded-lg p-2">💡</span>
              <h2 className="text-2xl md:text-3xl font-bold">
                Como identificamos o menor preço?
              </h2>
            </div>

            <p className="text-gray-700 text-lg mb-4">
              Monitoramos automaticamente o histórico de{" "}
              <span className="font-semibold text-primary">
                milhares de produtos
              </span>
              . Só aparecem aqui quando estão{" "}
              <span className="font-semibold text-success">
                abaixo da média histórica
              </span>
              .
            </p>

            <p className="text-gray-600 mb-2">
              Aqui você vê quedas reais, não promoções artificiais.
            </p>

            <p className="text-gray-500 text-sm">
              Atualização várias vezes ao dia para garantir oportunidades reais.
            </p>
          </div>
        </section>

        {/* ================= CATEGORIAS ================= */}
        <div className="space-y-28">
          {Object.entries(grouped).map(([categoria, group]) => (
            <div key={categoria}>
              <CategorySection categoria={categoria} group={group} />
            </div>
          ))}
        </div>
      </div>

      {/* ================= FAQ ================= */}
      <div className="mt-28">
        <FAQSection />
      </div>

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
