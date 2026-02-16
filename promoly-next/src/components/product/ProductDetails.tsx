"use client";

import type { Product } from "@/types";

type Props = {
  product: Product;
};

export default function ProductDetails({ product }: Props) {

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6 sm:gap-10 items-start">

      <div className="bg-gray-50 rounded-2xl p-4 sm:p-8 flex items-center justify-center">
        <img
          src={product.imagem_url ?? "/placeholder.png"}
          alt={product.titulo}
          className="max-h-[220px] sm:max-h-[420px] object-contain"
        />
      </div>

      <div className="flex flex-col gap-4">

        <h1 className="text-black text-sm sm:text-base leading-relaxed">
          {product.titulo}
        </h1>

        <span className="text-xs sm:text-sm text-gray-500">
          ID: {product.produto_id}
        </span>

        {product.avaliacao && (
          <div className="text-yellow-500 text-sm sm:text-base">
            ⭐ {product.avaliacao}
          </div>
        )}

        {(product.categorias ?? []).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {product.categorias?.map((cat, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium"
              >
                {cat}
              </span>
            ))}
          </div>
        )}

        {product.preco !== null && (
          <div className="text-2xl sm:text-4xl font-extrabold text-gray-900">
            {product.preco.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </div>
        )}

        {product.descricao && (
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
            {product.descricao}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          {product.url_afiliada && (
            <a
              href={product.url_afiliada}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 sm:px-8 py-3 rounded-xl text-center transition shadow-sm hover:shadow-md"
            >
              Ver oferta
            </a>
          )}

          <button
            onClick={handleCopyLink}
            className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 px-6 py-3 rounded-xl transition"
          >
            Copiar link
          </button>
        </div>

      </div>
    </div>
  );
}
