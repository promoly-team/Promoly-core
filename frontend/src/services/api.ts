import type { Offer } from "../types";

const API_URL = import.meta.env.VITE_API_URL;

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
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchOffers(limit = 20): Promise<Offer[]> {
  return apiGet<Offer[]>(`/products?limit=${limit}`);
}
