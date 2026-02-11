import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import ProductCard from "./components/ProductCard";
import ProductPage from "./components/ProductPage";
import CategoryPage from "./pages/Categorypage";
import { fetchProducts } from "./services/api";
import type { ProductCardData } from "./types";

function App() {
  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    fetchProducts(20)
      .then(setProducts)
      .catch(() => setProducts([]))
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
            <ProductCard
              key={p.produto_id}
              product={p}
            />
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
        <Route path="/produto/:slug" element={<ProductPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
