type ProductSchemaParams = {
  produto: {
    titulo: string;
    imagem_url?: string;
    descricao?: string;
    produto_id: string | number;
  };
  slug: string;
  baseUrl: string;
  currentPrice: number;
  decisionDescription: string;
};

export function buildProductSchemas({
  produto,
  slug,
  baseUrl,
  currentPrice,
  decisionDescription,
}: ProductSchemaParams) {
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: produto.titulo,
    image: produto.imagem_url,
    description: produto.descricao,
    sku: produto.produto_id,
    url: `${baseUrl}/produto/${slug}`,
    offers: {
      "@type": "Offer",
      url: `${baseUrl}/produto/${slug}`,
      priceCurrency: "BRL",
      price: currentPrice.toFixed(2),
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      priceValidUntil: "2026-12-31",
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `Vale a pena comprar ${produto.titulo}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: decisionDescription,
        },
      },
    ],
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: baseUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Ofertas",
        item: `${baseUrl}/ofertas`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: produto.titulo,
        item: `${baseUrl}/produto/${slug}`,
      },
    ],
  };

  return {
    productSchema,
    faqSchema,
    breadcrumbSchema,
  };
}
