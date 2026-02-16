import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import { fetchProducts } from "@/lib/api";
import { calculatePriceMetrics } from "@/utils/priceMetrics";
import { calculateOpportunityScore } from "@/utils/opportunityScore";
import type { ProductCardData } from "@/types";

export default async function HomePage() {
  const products: ProductCardData[] = await fetchProducts({
    order: "desconto",
    limit: 20,
  });

  /* =========================
     REMOVE DUPLICADOS
  ========================== */

  const unique = Array.from(
    new Map(products.map((p) => [p.produto_id, p])).values()
  );

  /* =========================
     ENRIQUECE PRODUTOS
  ========================== */

  const enhanced = unique.map((product) => {
    if ("preco_atual" in product && product.preco_atual != null) {
      const priceHistory = [
        { preco: product.preco_anterior ?? product.preco_atual },
        { preco: product.preco_atual },
      ];

      const metrics = calculatePriceMetrics(priceHistory);

      const priceDiffPercent =
        metrics.avgPrice > 0
          ? ((metrics.currentPrice - metrics.avgPrice) /
              metrics.avgPrice) *
            100
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
        priceDiffPercent,
        priceStatus:
          trend === "queda"
            ? "below"
            : trend === "alta"
            ? "above"
            : "equal",
        isBelowAverage: trend === "queda",
        opportunityScore,
      };
    }

    return product;
  });

  /* =========================
     RANKING POR SCORE
  ========================== */

  const ranked = enhanced.sort(
    (a: any, b: any) =>
      (b.opportunityScore ?? 0) - (a.opportunityScore ?? 0)
  );

  /* =========================
     CATEGORIAS
  ========================== */

  const categories = [
    { label: "Eletrônicos", slug: "eletronicos" },
    { label: "Casa", slug: "casa" },
    { label: "Pet", slug: "pet" },
    { label: "Games", slug: "games" },
    { label: "Fitness", slug: "fitness" },
    { label: "Automotivo", slug: "automotivo" },
  ];

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">

      <div className="max-w-7xl mx-auto px-6 py-16">

        {/* ================= HERO ================= */}

        <section className="text-center mb-20">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-6">
            Encontre o{" "}
            <span className="text-primary">menor preço</span> antes de comprar
          </h1>

          <p className="text-gray-600 max-w-2xl mx-auto text-lg mb-8">
            O Promoly monitora preços diariamente e identifica automaticamente
            quando um produto está abaixo da média histórica.
          </p>

          <Link
            href="/ofertas"
            className="
              inline-block
              bg-success
              hover:opacity-90
              text-white
              font-semibold
              px-8 py-3
              rounded-xl2
              shadow-medium
              transition
            "
          >
            🔥 Ver melhores ofertas
          </Link>

          <div className="flex justify-center gap-8 text-sm text-muted mt-10">
            <span>📊 +3.000 produtos monitorados</span>
            <span>📉 Atualização diária</span>
            <span>💰 Oportunidades reais</span>
          </div>
        </section>

        {/* ================= TOP 3 ================= */}

        <section className="mb-24">

          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-bold text-gray-900">
              🔥 Top oportunidades de hoje
            </h2>

            <Link
              href="/ofertas"
              className="text-primary font-semibold hover:underline"
            >
              Ver todas →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {ranked.slice(0, 3).map((p) => (
              <ProductCard
                key={`${p.produto_id}-top`}
                product={p}
              />
            ))}
          </div>
        </section>

        {/* ================= CATEGORIAS ================= */}

        <section className="mb-24">

          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Navegue por categorias
          </h2>

          <div className="flex flex-wrap gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/categoria/${cat.slug}`}
                className="
                  px-6 py-2.5
                  bg-surface
                  border border-gray-200
                  rounded-full
                  text-sm
                  font-medium
                  text-gray-800
                  hover:bg-primary
                  hover:text-white
                  hover:border-primary
                  transition
                  shadow-soft
                "
              >
                {cat.label}
              </Link>
            ))}
          </div>

        </section>

        {/* ================= GRID PRINCIPAL ================= */}

        <section>

          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-bold text-gray-900">
              Ofertas em destaque
            </h2>

            <Link
              href="/ofertas"
              className="
                bg-primary
                hover:bg-primary-hover
                text-white
                text-sm
                font-semibold
                px-6 py-2.5
                rounded-xl
                transition
                shadow-soft
              "
            >
              Ver todas →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8">
            {ranked.map((p) => (
              <ProductCard
                key={`${p.produto_id}-grid`}
                product={p}
              />
            ))}
          </div>

        </section>

      </div>
    </div>
  );
}
