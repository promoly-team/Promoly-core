import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import ProductCard from "./components/ProductCard";
import ProductPage from "./components/ProductPage";

import CategoryPage from "./pages/Categorypage";

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    fetch(`${API_URL}/products?limit=20`)
      .then(r => {
        if (!r.ok) throw new Error("Erro ao buscar produtos");
        return r.json();
      })
      .then(setProducts)
      .catch(err => {
        console.error(err);
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const Home = () => (
    <div className="container">
      <h1>Últimas ofertas</h1>

      {loading ? (
        <p>Carregando...</p>
      ) : (
        <div className="cards-grid">
          {products.map(p => (
            <ProductCard key={p.produto_id} product={p} />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/categoria/:slug" element={<CategoryPage />} />
        <Route path="/produto/:id" element={<ProductPage />} />
      </Routes>

    </BrowserRouter>
  );
}

export default App;
