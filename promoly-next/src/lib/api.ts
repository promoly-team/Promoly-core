import type { Offer, Product, ProductCardData } from "@/types";

/* ==================================================
   CONFIG
================================================== */

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8080"; // fallback seguro

if (!API_URL) {
  console.warn("⚠️ API_URL não definida, usando fallback.");
}

if (!API_URL) {
  throw new Error("API_URL não está definida nas variáveis de ambiente.");
}

/* ==================================================
   BASE FETCH (NEXT 15 SAFE)
================================================== */

async function apiGet<T>(
  path: string,
  options?: RequestInit & {
    revalidate?: number;
    noStore?: boolean;
  }
): Promise<T> {
  const { revalidate, noStore, ...fetchOptions } = options || {};

  const res = await fetch(`${API_URL}${path}`, {
    ...fetchOptions,
    ...(noStore ? { cache: "no-store" } : {}),
    ...(revalidate ? { next: { revalidate } } : {}),
  });

  if (!res.ok) {
    throw new Error(`API Error: ${res.status}`);
  }

  return res.json();
}

/* ==================================================
   PRODUCTS (LISTAGEM)
================================================== */

export async function fetchProducts(params?: {
  category?: string;
  search?: string;
  order?: string;
  limit?: number;
  offset?: number;
}): Promise<ProductCardData[]> {
  const {
    category,
    search,
    order = "desconto",
    limit = 20,
    offset = 0,
  } = params || {};

  const query = new URLSearchParams();

  if (category) query.append("category", category);
  if (search) query.append("search", search);

  query.append("order", order);
  query.append("limit", String(limit));
  query.append("offset", String(offset));

  return apiGet<ProductCardData[]>(
    `/products?${query.toString()}`,
    { revalidate: 30 }
  );
}

/* ==================================================
   OFFERS
================================================== */

export async function fetchOffers(limit = 20): Promise<Offer[]> {
  return apiGet<Offer[]>(`/offers?limit=${limit}`, {
    revalidate: 30,
  });
}

/* ==================================================
   PRODUCT DETAILS (BY ID - MAIS ROBUSTO)
================================================== */

export async function fetchProductById(
  id: number
): Promise<{
  produto: Product;
  similares: Product[];
}> {
  return apiGet(`/products/${id}`, {
    revalidate: 60,
  });
}

/* ==================================================
   PRODUCT DETAILS (BY SLUG - SEO)
================================================== */

export async function fetchProductBySlug(
  slug: string
): Promise<{
  produto: Product;
  similares: Product[];
}> {
  return apiGet(`/products/slug/${slug}`, {
    revalidate: 60,
  });
}

/* ==================================================
   PRICE HISTORY (DADOS DINÂMICOS)
================================================== */

export async function fetchPrices(
  productId: number
): Promise<{ preco: number; created_at: string }[]> {
  return apiGet(`/prices/${productId}`, {
    noStore: true,
  });
}

/* ==================================================
   CATEGORY (BY SLUG)
================================================== */

export async function fetchCategoryProducts(
  slug: string,
  params?: {
    limit?: number;
    offset?: number;
    search?: string;
    order?: string;
  }
): Promise<ProductCardData[]> {
  const {
    limit = 12,
    offset = 0,
    search,
    order = "desconto",
  } = params || {};

  const query = new URLSearchParams();

  query.append("limit", String(limit));
  query.append("offset", String(offset));
  query.append("order", order);

  if (search) query.append("search", search);

  return apiGet<ProductCardData[]>(
    `/categories/slug/${slug}/products?${query.toString()}`,
    { revalidate: 30 }
  );
}

/* ==================================================
   CATEGORY TOTAL
================================================== */

export async function fetchCategoryTotal(
  slug: string,
  search?: string
): Promise<{ total: number }> {
  const query = new URLSearchParams();

  if (search) query.append("search", search);

  return apiGet<{ total: number }>(
    `/categories/slug/${slug}/total?${query.toString()}`,
    { revalidate: 30 }
  );
}


/* ==================================================
   ALL PRODUCTS (SITEMAP)
================================================== */

export async function fetchAllProducts(): Promise<{
  produto_id: number;
  slug: string;
  updated_at?: string;
}[]> {
  return apiGet(`/products/sitemap`, {
    revalidate: 3600, // 1h
  });
}

/* ==================================================
   ALL CATEGORIES (SITEMAP)
================================================== */

export async function fetchAllCategories(): Promise<{
  slug: string;
}[]> {
  return apiGet(`/categories/sitemap`, {
    revalidate: 3600,
  });
}


export async function fetchProductsWithMetrics(params?: {
  category?: string;
  below_average?: boolean;
  limit?: number;
  offset?: number;
}) {

  const query = new URLSearchParams();

  if (params?.category) {
    query.append("category", params.category);
  }

  if (params?.below_average) {
    query.append("below_average", "true");
  }

  query.append("limit", String(params?.limit ?? 100));
  query.append("offset", String(params?.offset ?? 0));

  return apiGet<any[]>(
    `/products/with-metrics?${query.toString()}`,
    { revalidate: 300 }
  );
}
