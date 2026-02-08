import type { ProductCardData } from "../types";

/**
 * URL base da API
 */
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
   ENDPOINTS TIPADOS
========================= */

export function fetchProductsByCategory(
  categoryId: number,
  limit = 20
): Promise<ProductCardData[]> {
  return apiGet<ProductCardData[]>(
    `/categories/${categoryId}/products/?limit=${limit}`
  );
}
