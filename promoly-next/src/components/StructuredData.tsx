export default function StructuredData() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "PromoLy",
    url: "https://promoly-core.vercel.app",
    description:
      "Compare preços e acompanhe histórico real antes de comprar.",
    potentialAction: {
      "@type": "SearchAction",
      target:
        "https://promoly-core.vercel.app/ofertas?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd),
      }}
    />
  );
}
