import type { Offer } from "../types";

/**
 * URL base da API
 * Definida no Vercel e no .env local
 *
 * VITE_API_URL=https://promoly-core-production.up.railway.app
 */
const API_URL = "https://promoly-core-production.up.railway.app";

if (!API_URL) {
  throw new Error("VITE_API_URL não definida");
}

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

      throw {
        status: res.status,
        message,
      } as ApiError;
    }

    return res.json();
  } catch (err) {
    if ((err as any).name === "AbortError") {
      throw {
        status: 408,
        message: "Timeout ao conectar com o servidor",
      } as ApiError;
    }

    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

/* =========================
   ENDPOINTS (COM SLASH FINAL)
========================= */

export function fetchProducts(limit = 20) {
  return apiGet(`/products/?limit=${limit}`);
}

export function fetchOffers(limit = 20): Promise<Offer[]> {
  return apiGet(`/offers/?limit=${limit}`);
}

export function fetchDeals(limit = 20) {
  return apiGet(`/deals/?limit=${limit}`);
}

export function fetchProduct(productId: number) {
  return apiGet(`/products/${productId}`);
}

export function fetchPrices(productId: number) {
  return apiGet(`/prices/${productId}`);
}
