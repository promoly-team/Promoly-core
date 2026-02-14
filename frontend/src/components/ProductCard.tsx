import { useNavigate } from "react-router-dom";
import { goToProduct } from "../services/api";
import type { ProductCardData } from "../types";

type Props = {
  product: ProductCardData;
};

export default function ProductCard({ product }: Props) {
  const navigate = useNavigate();
  const isDeal = "preco_atual" in product;

  return (
    <div className="relative bg-white rounded-2xl shadow-sm hover:shadow-md transition p-4 group">

      {/* BADGE */}
      {isDeal && product.desconto_pct && (
        <span className="absolute top-3 left-3 z-20 bg-[#22c177] text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
          -{product.desconto_pct}%
        </span>
      )}

      {/* IMAGEM */}
      <div
        onClick={() => navigate(`/produto/${product.produto_id}`)}
        className="bg-gray-50 rounded-xl p-4 flex items-center justify-center cursor-pointer overflow-hidden"
      >
        <img
          src={product.imagem_url}
          alt={product.titulo}
          loading="lazy"
          className="relative z-0 h-36 object-contain transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* CONTEÚDO */}
      <div className="mt-4 flex flex-col gap-2">

        <div
          onClick={() => navigate(`/produto/${product.produto_id}`)}
          className="text-sm font-medium text-gray-800 line-clamp-2 cursor-pointer hover:text-[#2563eb] transition"
        >
          {product.titulo}
        </div>

        {/* PREÇO */}
        <div className="flex flex-col">

          {isDeal ? (
            <>
              {product.preco_anterior != null && (
                <span className="text-xs text-gray-400 line-through">
                  R$ {product.preco_anterior.toFixed(2)}
                </span>
              )}

              <span className="text-lg font-bold text-[#22c177]">
                R$ {product.preco_atual.toFixed(2)}
              </span>
            </>
          ) : (
            <span className="text-lg font-bold text-[#22c177]">
              {product.preco != null
                ? `R$ ${product.preco.toFixed(2)}`
                : "Preço indisponível"}
            </span>
          )}

        </div>

        {/* BOTÕES */}
        <div className="flex gap-2 mt-3">

          <button
            onClick={() => navigate(`/produto/${product.produto_id}`)}
            className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black text-sm font-semibold py-2 rounded-lg transition"
          >
            Detalhes
          </button>

          <button
            onClick={() => goToProduct(product.produto_id)}
            className="flex-1 bg-[#2563eb] hover:bg-blue-700 text-white text-sm font-semibold py-2 rounded-lg transition"
          >
            Ver Oferta
          </button>

        </div>
      </div>
    </div>
  );
}
