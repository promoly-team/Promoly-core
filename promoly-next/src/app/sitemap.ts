import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://promoly.com.br",
      lastModified: new Date(),
    },
  ];
}
