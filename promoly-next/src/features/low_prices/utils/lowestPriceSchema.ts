type EnrichedProduct = {
  titulo: string;
  imagem_url?: string;
  currentPrice: number;
  slug: string;
  produto_id: number;
};

export function buildLowestPriceSchemas(
  enriched: EnrichedProduct[],
  baseUrl: string,
) {
  /* ================= FAQ SCHEMA ================= */

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Como saber se é uma queda real de preço?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Um produto só aparece nesta página quando o preço atual está abaixo da média histórica registrada no monitoramento do Promoly.",
        },
      },
      {
        "@type": "Question",
        name: "Com que frequência os preços são atualizados?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Os preços são monitorados várias vezes ao dia.",
        },
      },
      {
        "@type": "Question",
        name: "Como funciona a média histórica?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "A média histórica é calculada com base nos preços anteriores registrados ao longo do tempo.",
        },
      },
    ],
  };

  /* ================= ITEM LIST SCHEMA ================= */

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: enriched.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Product",
        name: product.titulo,
        image: product.imagem_url,
        offers: {
          "@type": "Offer",
          priceCurrency: "BRL",
          price: product.currentPrice,
          availability: "https://schema.org/InStock",
          url: `${baseUrl}/produto/${product.slug}-${product.produto_id}`,
          priceValidUntil: new Date(
            Date.now() + 24 * 60 * 60 * 1000,
          ).toISOString(),
        },
      },
    })),
  };

  return {
    faqSchema,
    itemListSchema,
  };
}
