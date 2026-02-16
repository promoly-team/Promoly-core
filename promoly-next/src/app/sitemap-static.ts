import type { MetadataRoute } from "next";
import { fetchAllCategories } from "@/lib/api";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ||
  "https://promoly-core.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {

  const categories = await fetchAllCategories();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1,
    },
  ];

  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${BASE_URL}/categoria/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.8,
  }));

  return [...staticPages, ...categoryPages];
}
