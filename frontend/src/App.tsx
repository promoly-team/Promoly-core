import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import ProductPage from "./pages/ProductPage";
import CategoryPage from "./pages/CategoryPage";
import HomePage from "./pages/HomePage";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/ofertas" element={<CategoryPage />} />
        <Route path="/categoria/:slug" element={<CategoryPage />} />
        <Route path="/produto/:id" element={<ProductPage />} />
      </Routes>

    </BrowserRouter>
  );
}

export default App;
