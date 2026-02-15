import type { Offer, Product, ProductCardData } from "../types";

/* const API_URL = "https://promoly-core-production.up.railway.app";*/

const API_URL = "http://localhost:8080";

/* =========================
   TIPOS
========================= */

type ApiError = {
  status: number;
  message: string;
};

export type PriceHistoryItem = {
  preco: number;
  data: string;
};

type FetchProductsParams = {
  category?: string;
  search?: string;
  order?: string;
  limit?: number;
  offset?: number;
};

/* =========================
   CORE REQUEST
========================= */

export async function apiGet<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const res = await fetch(`${API_URL}${path}`, {
      method: "GET",
      ...options,
      signal: controller.signal,
    });

    if (!res.ok) {
      let message = "Erro inesperado";

      try {
        const data = await res.json();
        message = data?.detail || data?.message || message;
      } catch {}

      throw { status: res.status, message } as ApiError;
    }

    return res.json() as Promise<T>;
  } finally {
    clearTimeout(timeout);
  }
}

/* =========================
   PRODUCTS (COMPATÍVEL)
========================= */

export function fetchProducts(
  params: number | FetchProductsParams = 20
): Promise<ProductCardData[]> {

  // 🔹 Modo antigo: fetchProducts(20)
  if (typeof params === "number") {
    return apiGet<ProductCardData[]>(`/products?limit=${params}`);
  }

  // 🔹 Modo novo: fetchProducts({ ... })
  const {
    category,
    search,
    order = "desconto",
    limit = 20,
    offset = 0,
  } = params;

  const query = new URLSearchParams();

  if (category) query.append("category", category);
  if (search) query.append("search", search);

  query.append("order", order);
  query.append("limit", String(limit));
  query.append("offset", String(offset));

  return apiGet<ProductCardData[]>(`/products?${query.toString()}`);
}

/* =========================
   OFFERS
========================= */

export function fetchOffers(
  limit = 20
): Promise<Offer[]> {
  return apiGet<Offer[]>(`/offers?limit=${limit}`);
}

/* =========================
   PRODUCT DETAILS
========================= */

export function fetchProduct(
  productId: number
): Promise<{
  produto: Product;
  similares: Product[];
}> {
  return apiGet(`/products/${productId}`);
}

/* =========================
   PRICE HISTORY
========================= */

export function fetchPrices(
  productId: number
): Promise<PriceHistoryItem[]> {
  return apiGet<PriceHistoryItem[]>(`/prices/${productId}`);
}

/* =========================
   REDIRECT AFILIADO
========================= */

export function goToProduct(produto_id: number) {
  window.open(`${API_URL}/go/${produto_id}`, "_blank");
}
