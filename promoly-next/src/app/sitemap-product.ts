import type { MetadataRoute } from "next";
import { fetchAllProducts } from "@/lib/api";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ||
  "https://promoly-core.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {

  const products = await fetchAllProducts();

  return products.map((product) => ({
    url: `${BASE_URL}/produto/${product.slug}-${product.produto_id}`,
    lastModified: new Date(product.updated_at || Date.now()),
    changeFrequency: "daily",
    priority: 0.7,
  }));
}
