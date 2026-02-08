import { useEffect, useState } from "react";
import {
  fetchProductsByCategory,
} from "./services/api";
import { ProductCard } from "./components/ProductCard";
import type { ProductCardData } from "./types";
import "./App.css";

/* =========================
   MOCK DE CATEGORIAS
   (pode virar endpoint depois)
========================= */

const CATEGORIES = [
  { id: 1, nome: "Eletrônicos" },
  { id: 2, nome: "Casa" },
  { id: 3, nome: "Pet" },
  { id: 4, nome: "Games" },
];

/* =========================
   APP
========================= */

function App() {
  const [items, setItems] = useState<ProductCardData[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoriaAtiva, setCategoriaAtiva] = useState<number>(
    CATEGORIES[0].id
  );

  useEffect(() => {
    setLoading(true);

    fetchProductsByCategory(categoriaAtiva)
      .then(setItems)
      .finally(() => setLoading(false));
  }, [categoriaAtiva]);

  return (
    <div className="app-layout">
      {/* ================= SIDEBAR ================= */}
      <aside className="sidebar">
        <h2 className="sidebar-title">Categorias</h2>

        <ul className="category-list">
          {CATEGORIES.map((cat) => (
            <li
              key={cat.id}
              className={
                cat.id === categoriaAtiva
                  ? "category-item active"
                  : "category-item"
              }
              onClick={() => setCategoriaAtiva(cat.id)}
            >
              {cat.nome}
            </li>
          ))}
        </ul>
      </aside>

      {/* ================= CONTEÚDO ================= */}
      <div className="content">
        <header className="header">
          🔥 PROMOLY – Ofertas
        </header>

        {loading ? (
          <p style={{ color: "white" }}>Carregando...</p>
        ) : (
          <main className="container">
            {items.length === 0 ? (
              <p style={{ color: "white" }}>
                Nenhuma oferta disponível para esta categoria.
              </p>
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
        )}
      </div>
    </div>
  );
}

export default App;
