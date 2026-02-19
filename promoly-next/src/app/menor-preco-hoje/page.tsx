import { fetchProducts } from "@/lib/api";
import { enrichProducts } from "@/features/low_prices/utils/enrichProducts";
import LowPriceView from "@/features/low_prices/LowPricesView";

export default async function MenorPrecoHojePage() {
  const products = await fetchProducts({
    order: "desconto",
    limit: 40,
  });

  const enriched = await enrichProducts(products);

  if (enriched.length === 0) {
    return (
      <div className="p-20 text-center">Nenhuma oportunidade encontrada.</div>
    );
  }

  const heroProduct = [...enriched].sort(
    (a, b) => a.priceDiffPercent - b.priceDiffPercent,
  )[0];

  const grouped = enriched.reduce(
    (acc, product) => {
      const nome = product.categoria_nome || "Outros";
      const slug = product.categoria_slug || "outros";

      if (!acc[nome]) {
        acc[nome] = { slug, items: [] };
      }

      acc[nome].items.push(product);
      return acc;
    },
    {} as Record<string, { slug: string; items: any[] }>,
  );

  return (
    <LowPriceView
      enriched={enriched}
      grouped={grouped}
      heroProduct={heroProduct}
      baseUrl={process.env.NEXT_PUBLIC_API_URL!}
    />
  );
}
