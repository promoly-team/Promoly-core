import type { MetadataRoute } from "next";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ||
  "https://promoly-core.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${BASE_URL}/sitemap-static.xml`,
      lastModified: new Date(),
    },
    {
      url: `${BASE_URL}/sitemap-products.xml`,
      lastModified: new Date(),
    },
  ];
}
