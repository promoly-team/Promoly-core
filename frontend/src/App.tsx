import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import ProductCard from "./components/ProductCard.tsx";
import CategoryPage from "./pages/Categorypage";

function App() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // HOME = últimos produtos
  useEffect(() => {
    setLoading(true);

    fetch("/products?limit=20")
      .then(r => r.json())
      .then(setProducts)
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
