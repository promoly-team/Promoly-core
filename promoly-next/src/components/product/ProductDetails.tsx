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
    <div className="grid md:grid-cols-2 gap-10 items-start">

      <div className="bg-gray-50 rounded-3xl p-8 flex items-center justify-center">
        <img
          src={product.imagem_url ?? "/placeholder.png"}
          alt={`Imagem do produto ${product.titulo}`}
          className="max-h-[420px] object-contain"
        />
      </div>

      <div className="flex flex-col gap-5">

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
          {product.titulo}
        </h1>

        {product.preco !== null && (
          <div className="text-4xl font-extrabold text-blue-600">
            {product.preco.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </div>
        )}

        {product.descricao && (
          <p className="text-gray-700 leading-relaxed">

            {product.descricao}
          </p>
        )}


        <div className="flex gap-4 mt-6 flex-wrap">

          {product.url_afiliada && (
            <a
              href={product.url_afiliada}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl transition shadow-md hover:shadow-lg"
            >
              Comprar pelo menor preço
            </a>
          )}

          <button
            onClick={handleCopyLink}
            className="bg-gray-100 text-gray-800 hover:bg-gray-200 px-6 py-3 rounded-xl transition"
          >
            Copiar link
          </button>

        </div>

      </div>
    </div>
  );
}
