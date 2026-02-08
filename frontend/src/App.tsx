import { useEffect, useState } from "react";
import { fetchProductsByCategory } from "./services/api";
import { ProductCard } from "./components/ProductCard";
import type { ProductCardData } from "./types";
import "./App.css";

const CATEGORIES = [
  { id: 1, nome: "Eletrônicos" },
  { id: 2, nome: "Casa" },
  { id: 3, nome: "Pet" },
];

function App() {
  const [items, setItems] = useState<ProductCardData[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoriaAtiva, setCategoriaAtiva] = useState<number>(1);

  useEffect(() => {
    setLoading(true);

    fetchProductsByCategory(categoriaAtiva)
      .then((data) => {
        setItems(data); // agora tipado corretamente
      })
      .finally(() => setLoading(false));
  }, [categoriaAtiva]);

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <h2>Categorias</h2>
        <ul>
          {CATEGORIES.map((cat) => (
            <li
              key={cat.id}
              className={cat.id === categoriaAtiva ? "active" : ""}
              onClick={() => setCategoriaAtiva(cat.id)}
            >
              {cat.nome}
            </li>
          ))}
        </ul>
      </aside>

      <main className="content">
        <header className="header">
          🔥 PROMOLY – Ofertas
        </header>

        {loading ? (
          <p style={{ color: "white" }}>Carregando...</p>
        ) : (
          <div className="cards-grid">
            {items.map((item) => (
              <ProductCard
                key={item.produto_id}
                data={item}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
