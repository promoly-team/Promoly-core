import type { MetadataRoute } from "next";
import { fetchAllProducts, fetchAllCategories } from "@/lib/api";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ||
  "https://promoly-core.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {

  const products = await fetchAllProducts();
  const categories = await fetchAllCategories();

  const homepage: MetadataRoute.Sitemap = [
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

  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${BASE_URL}/produto/${product.slug}-${product.produto_id}`,
    lastModified: new Date(product.updated_at || Date.now()),
    changeFrequency: "daily",
    priority: 0.7,
  }));

  return [
    ...homepage,
    ...categoryPages,
    ...productPages,
  ];
}
