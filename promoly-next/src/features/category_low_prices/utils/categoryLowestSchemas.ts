export function buildCategoryLowestSchemas({
  baseUrl,
  slug,
  categoriaNome,
  products,
}: {
  baseUrl: string;
  slug: string;
  categoriaNome: string;
  products: any[];
}) {
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
        name: categoriaNome,
        item: `${baseUrl}/categoria/${slug}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Menor Preço",
        item: `${baseUrl}/categoria/${slug}/menor-preco`,
      },
    ],
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: products.map((p, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Product",
        name: p.titulo,
        image: p.imagem_url,
        offers: {
          "@type": "Offer",
          priceCurrency: "BRL",
          price: p.current_price,
          availability: "https://schema.org/InStock",
          url: `${baseUrl}/produto/${p.slug}-${p.produto_id}`,
        },
      },
    })),
  };

  return { breadcrumbSchema, itemListSchema };
}
