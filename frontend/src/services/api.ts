import type { Offer, Product, ProductCardData } from "../types";

const API_URL = "https://promoly-core-production.up.railway.app";

type ApiError = {
  status: number;
  message: string;
};

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
   ENDPOINTS
========================= */

export function fetchProducts(
  limit = 20
): Promise<ProductCardData[]> {
  return apiGet<ProductCardData[]>(`/products?limit=${limit}`);
}

export function fetchOffers(
  limit = 20
): Promise<Offer[]> {
  return apiGet<Offer[]>(`/offers?limit=${limit}`);
}

export function fetchProduct(
  slug: string
): Promise<{
  produto: Product;
  similares: Product[];
}> {
  return apiGet(`/products/${slug}`);
}

export function fetchPrices(productId: number) {
  return apiGet(`/prices/${productId}`);
}

export function goToProduct(produto_id: number) {
  window.open(`${API_URL}/go/${produto_id}`, "_blank");
}
