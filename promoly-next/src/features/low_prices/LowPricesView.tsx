import Highlight from "./components/HeroHighlight";
import CategorySection from "./components/CategorySections";
import FAQSection from "./components/FAQSection";
import { buildLowestPriceSchemas } from "./utils/lowestPriceSchema";
import type { EnrichedProduct } from "@/types";

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
    <div className="bg-[#000D34] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {/* ================= HEADER ================= */}
        <header className="mb-20 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#9AEBA3] leading-tight mb-4">
            🔥 Radar de Oportunidades –{" "}
            <span className="text-[#F5F138]">
              Produtos abaixo da média histórica
            </span>
          </h1>

          <p className="text-[#45C4B0] text-lg">Atualizado em {today}</p>
        </header>

        {/* ================= HERO GLOBAL ================= */}
        <section className="mb-24">
          <div className="bg-[#0a154a] rounded-2xl border border-[#45C4B0] p-6 sm:p-10 shadow-lg">
            <Highlight product={heroProduct} />
          </div>
        </section>

        {/* ================= EXPLICAÇÃO SEO ================= */}
        <section className="max-w-3xl mx-auto mb-28">
          <div className="bg-[#0a154a] rounded-2xl border border-[#45C4B0] p-8 sm:p-12 text-center shadow-lg">
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="text-2xl bg-[#45C4B0] text-[#000D34] rounded-lg px-3 py-1 font-bold">
                💡
              </span>

              <h2 className="text-2xl md:text-3xl font-bold text-[#9AEBA3]">
                Como identificamos o menor preço?
              </h2>
            </div>

            <p className="text-[#45C4B0] text-lg mb-4 font-bold">
              Monitoramos automaticamente o histórico de{" "}
              <span className="text-[#F5F138]">milhares de produtos</span>. Só
              aparecem aqui quando estão{" "}
              <span className="text-[#F5F138]">abaixo da média histórica</span>.
            </p>

            <p className="text-[#45C4B0] mb-2 font-bold">
              Aqui você vê quedas reais, não promoções artificiais.
            </p>

            <p className="text-[#45C4B0] text-sm opacity-80 font-bold">
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
