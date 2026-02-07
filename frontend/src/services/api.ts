const API_URL = "http://localhost:8080";

export async function fetchDeals() {
  const res = await fetch(`${API_URL}/deals?limit=20`);
  if (!res.ok) {
    throw new Error("Erro ao buscar deals");
  }
  return res.json();
}


export async function fetchOffers(limit = 20, offset = 0) {
  const res = await fetch(
    `${API_URL}/offers?limit=${limit}&offset=${offset}`
  );
  return res.json();
} 