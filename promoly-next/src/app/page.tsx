import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import { fetchProducts } from "@/lib/api";
import { calculatePriceMetrics } from "@/utils/priceMetrics";
import { calculateOpportunityScore } from "@/utils/opportunityScore";
import type { ProductCardData } from "@/types";
import type { Metadata } from "next";

/* =====================================================
   🔥 METADATA COMPLETA
===================================================== */

export const metadata: Metadata = {
  title: "PromoLy – Compare preços e encontre o menor valor",
  description:
    "Compare preços, acompanhe o histórico e descubra quando um produto está realmente abaixo da média. PromoLy monitora milhares de ofertas diariamente.",
  keywords: [
    "menor preço",
    "comparador de preços",
    "histórico de preço",
    "promoções online",
    "ofertas hoje",
    "descontos reais",
  ],
  authors: [{ name: "PromoLy" }],
  creator: "PromoLy",
  publisher: "PromoLy",

  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://promoly-core.vercel.app",
    siteName: "PromoLy",
    title: "PromoLy – Compare preços e encontre o menor valor",
    description:
      "Acompanhe histórico de preços e descubra oportunidades reais antes de comprar.",
    images: [
      {
        url: "https://promoly-core.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "PromoLy – Compare preços antes de comprar",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "PromoLy – Compare preços e encontre o menor valor",
    description: "Descubra quando um produto está realmente barato.",
    images: ["https://promoly-core.vercel.app/og-image.png"],
  },

  alternates: {
    canonical: "https://promoly-core.vercel.app",
  },

  robots: {
    index: true,
    follow: true,
  },
};

/* =====================================================
   🔥 HOMEPAGE
===================================================== */

export const revalidate = 60;

export default async function HomePage() {
  const products: ProductCardData[] = await fetchProducts({
    order: "desconto",
    limit: 20,
  });

  const unique = Array.from(
    new Map(products.map((p) => [p.produto_id, p])).values(),
  );

  const enhanced = unique.map((product) => {
    if ("preco_atual" in product && product.preco_atual != null) {
      const priceHistory = [
        { preco: product.preco_anterior ?? product.preco_atual },
        { preco: product.preco_atual },
      ];

      const metrics = calculatePriceMetrics(priceHistory);

      const priceDiffPercent =
        metrics.avgPrice > 0
          ? ((metrics.currentPrice - metrics.avgPrice) / metrics.avgPrice) * 100
          : 0;

      const trend =
        priceDiffPercent < -0.5
          ? "queda"
          : priceDiffPercent > 0.5
            ? "alta"
            : "estabilidade";

      const opportunityScore = calculateOpportunityScore({
        priceDiffPercent,
        descontoPct: product.desconto_pct ?? 0,
        trend,
        historyLength: priceHistory.length,
      });

      return {
        ...product,
        opportunityScore,
      };
    }

    return product;
  });

  const ranked = enhanced.sort(
    (a: any, b: any) => (b.opportunityScore ?? 0) - (a.opportunityScore ?? 0),
  );

  const BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "https://promoly-core.vercel.app";

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: ranked.slice(0, 10).map((product, index) => ({
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

  const categories = [
    { label: "Eletrônicos", slug: "eletronicos", icon: "💻" },
    { label: "Casa", slug: "casa", icon: "🏠" },
    { label: "Pet", slug: "pet", icon: "🐾" },
    { label: "Games", slug: "games", icon: "🎮" },
    { label: "Fitness", slug: "fitness", icon: "🏋️" },
    { label: "Automotivo", slug: "automotivo", icon: "🚗" },
  ];

  /* ===== MÉTRICAS DA HOME ===== */
  const discounts = ranked
    .map((p: any) => p.desconto_pct ?? 0)
    .filter((d: number) => d > 0);

  const maxDiscount = discounts.length ? Math.max(...discounts) : 0;
  const avgDiscount = discounts.length
    ? Math.round(discounts.reduce((a, b) => a + b, 0) / discounts.length)
    : 0;
  const belowAvgCount = ranked.filter(
    (p: any) => (p.desconto_pct ?? 0) >= 15,
  ).length;

  const stats = [
    { label: "Ofertas monitoradas", value: ranked.length, accent: "text-ink" },
    { label: "Maior queda hoje", value: `${maxDiscount}%`, accent: "text-success" },
    { label: "Queda média", value: `${avgDiscount}%`, accent: "text-primary" },
    { label: "Oportunidades", value: belowAvgCount, accent: "text-accent" },
  ];

  return (
    <>
      {/* 🔥 STRUCTURED DATA */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "PromoLy",
            url: BASE_URL,
            description:
              "Compare preços e acompanhe histórico real antes de comprar.",
            potentialAction: {
              "@type": "SearchAction",
              target: `${BASE_URL}/ofertas?q={search_term_string}`,
              "query-input": "required name=search_term_string",
            },
          }),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(itemListSchema),
        }}
      />

      <div className="bg-base min-h-screen">
        {/* glow de fundo do hero */}
        <div className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-[420px] w-[820px] max-w-full rounded-full bg-primary/20 blur-[140px]"
          />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-12 sm:pt-24">
            {/* HERO */}
            <section className="text-center max-w-3xl mx-auto">
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-ink-muted bg-panel border border-line rounded-full px-4 py-1.5 mb-6">
                <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                Monitorando preços em tempo real
              </span>

              <h1 className="text-3xl sm:text-5xl font-extrabold text-ink leading-tight mb-5">
                Compre no <span className="text-success">menor preço</span>,
                <br className="hidden sm:block" /> sem cair em falsa promoção
              </h1>

              <p className="text-ink-muted max-w-xl mx-auto text-base sm:text-lg mb-8">
                Acompanhe o histórico real de preços e descubra quando um produto
                está de fato abaixo da média histórica.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/menor-preco-hoje"
                  className="inline-flex items-center justify-center bg-success hover:bg-success-glow text-[#052e16] text-base font-bold px-8 py-3 rounded-xl shadow-glow transition"
                >
                  🔥 Ver melhores ofertas
                </Link>
                <Link
                  href="/categoria/eletronicos"
                  className="inline-flex items-center justify-center bg-panel hover:bg-panel-subtle text-ink border border-line font-semibold px-8 py-3 rounded-xl transition"
                >
                  Explorar categorias
                </Link>
              </div>
            </section>

            {/* MÉTRICAS */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-12 sm:mt-16">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="bg-panel border border-line rounded-2xl p-4 sm:p-6 text-center"
                >
                  <div className={`text-2xl sm:text-3xl font-extrabold ${s.accent}`}>
                    {s.value}
                  </div>
                  <div className="text-xs sm:text-sm text-ink-muted mt-1">
                    {s.label}
                  </div>
                </div>
              ))}
            </section>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
          {/* TOP OPORTUNIDADES */}
          <section className="mb-16 sm:mb-20">
            <div className="flex items-end justify-between mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-ink">
                🔥 Top oportunidades de hoje
              </h2>
              <Link
                href="/menor-preco-hoje"
                className="text-sm font-medium text-ink-muted hover:text-success transition shrink-0"
              >
                Ver todas →
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {ranked.slice(0, 3).map((p) => (
                <ProductCard key={`${p.produto_id}-top`} product={p} />
              ))}
            </div>
          </section>

          {/* CATEGORIAS */}
          <section className="mb-16 sm:mb-20">
            <h2 className="text-xl sm:text-2xl font-bold text-ink mb-6">
              Navegue por categorias
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/categoria/${cat.slug}`}
                  className="group flex flex-col items-center gap-2 bg-panel border border-line rounded-2xl px-4 py-5 text-center hover:border-primary/50 hover:bg-panel-elevated transition"
                >
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="text-sm font-medium text-ink-muted group-hover:text-ink transition">
                    {cat.label}
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {/* GRID */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-ink mb-6 sm:mb-8">
              Ofertas em destaque
            </h2>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
              {ranked.map((p) => (
                <ProductCard key={`${p.produto_id}-grid`} product={p} />
              ))}
            </div>
          </section>

          {/* SEO TEXTO */}
          <section className="mt-20 max-w-3xl">
            <h2 className="text-xl sm:text-2xl font-bold text-ink mb-4">
              Como encontrar o menor preço online?
            </h2>
            <p className="text-ink-muted leading-relaxed">
              O PromoLy é um comparador de preços que analisa o histórico de
              valores e identifica oportunidades reais. Antes de comprar,
              verifique se o preço atual está abaixo da média histórica.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
