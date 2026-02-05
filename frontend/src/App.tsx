import { useEffect, useState } from "react";
import { fetchOffers } from "./services/api";
import { ProductCard } from "./components/ProductCard";
import type { ProductCardData } from "./types";
import "./App.css";

function App() {
  const [items, setItems] = useState<ProductCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOffers()
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ color: "white" }}>Carregando...</p>;

  return (
    <>
      <header className="header">🔥 PROMOLY – Ofertas</header>

      <main className="container">
        <div className="cards-grid">
          {items.map((item) => (
            <ProductCard key={item.produto_id} data={item} />
          ))}
        </div>
      </main>
    </>
  );
}

export default App;
