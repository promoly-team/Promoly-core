"use client";

import Link from "next/link";
import type { ProductCardData } from "@/types";

type Props = {
  product: ProductCardData;
};

export default function ProductCard({ product }: Props) {
  const isDeal = "preco_atual" in product;

  // 🔥 URL correta com slug + ID
  const productUrl = `/produto/${product.slug}-${product.produto_id}`;

  return (
    <div className="relative bg-white rounded-2xl shadow-sm hover:shadow-md transition p-4 group">

      {/* BADGE */}
      {isDeal && product.desconto_pct && (
        <span className="absolute top-3 left-3 z-20 bg-[#22c177] text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
          -{product.desconto_pct}%
        </span>
      )}

      {/* IMAGEM */}
      <Link
        href={productUrl}
        className="bg-gray-50 rounded-xl p-4 flex items-center justify-center overflow-hidden"
      >
        <img
          src={product.imagem_url}
          alt={product.titulo}
          className="h-36 object-contain transition-transform duration-300 group-hover:scale-105"
        />
      </Link>

      {/* CONTEÚDO */}
      <div className="mt-4 flex flex-col gap-2">

        <Link
          href={productUrl}
          className="text-sm font-medium text-gray-900 line-clamp-2 hover:text-[#2563eb] transition"
        >
          {product.titulo}
        </Link>

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

          <Link
            href={productUrl}
            className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black text-sm font-semibold py-2 rounded-lg transition text-center"
          >
            Detalhes
          </Link>

          <a
            href={product.url_afiliada}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-[#2563eb] hover:bg-blue-700 text-white text-sm font-semibold py-2 rounded-lg transition text-center"
          >
            Ver Oferta
          </a>

        </div>
      </div>
    </div>
  );
}
