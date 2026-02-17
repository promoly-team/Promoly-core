export default function StructuredData() {
  const structuredData = [
    {
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
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "PromoLy",
      url: "https://promoly-core.vercel.app",
      logo: "https://promoly-core.vercel.app/og-image.png",
      sameAs: [
        "https://instagram.com/Promoly__",
        "https://twitter.com/Promoly_",
      ],
    },
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  );
}
