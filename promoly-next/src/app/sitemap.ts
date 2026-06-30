import type { MetadataRoute } from "next";
import { fetchAllProducts, fetchAllCategories } from "@/lib/api";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://promoly-core.vercel.app/";

// Gera o sitemap em runtime (request-time), nunca em build.
// Evita que a indisponibilidade da API durante o build quebre o deploy.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Se a API estiver indisponível, degrada para um sitemap mínimo
  // em vez de derrubar a renderização da rota.
  const [products, categories] = await Promise.all([
    fetchAllProducts().catch(() => []),
    fetchAllCategories().catch(() => []),
  ]);

  const now = new Date();

  /* ================= HOME ================= */

  const homepage: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 1,
    },
  ];

  /* ================= MENOR PREÇO HOJE ================= */

  const lowestPricePage: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/menor-preco-hoje`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.95,
    },
  ];

  /* ================= CATEGORIAS ================= */

  const categoryPages: MetadataRoute.Sitemap = categories.flatMap((cat) => [
    {
      url: `${BASE_URL}/categoria/${cat.slug}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/categoria/${cat.slug}/menor-preco`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9, // 🔥 mais importante que categoria normal
    },
  ]);

  /* ================= PRODUTOS ================= */

  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${BASE_URL}/produto/${product.slug}-${product.produto_id}`,
    lastModified: new Date(product.updated_at || now),
    changeFrequency: "daily",
    priority: 0.7,
  }));

  return [...homepage, ...lowestPricePage, ...categoryPages, ...productPages];
}
