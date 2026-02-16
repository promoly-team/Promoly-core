"use client";

import Image from "next/image";
import type { Product } from "@/types";

type Props = {
  product: Product;
  onCopyLink: () => void;
};

export default function ProductDetails({ product, onCopyLink }: Props) {
  return (
    <div className="grid md:grid-cols-2 gap-8 items-start">

      {/* ================= IMAGEM ================= */}
      <div className="bg-gray-50 rounded-2xl p-6 sm:p-10 flex items-center justify-center">
        <Image
          src={product.imagem_url}
          alt={product.titulo}
          width={500}
          height={500}
          className="object-contain max-h-[320px] sm:max-h-[420px]"
          priority
        />
      </div>

      {/* ================= INFORMAÇÕES ================= */}
      <div className="flex flex-col gap-5">

        {/* TÍTULO */}
        <h1 className="text-xl sm:text-3xl font-semibold text-gray-900 leading-snug">
          {product.titulo}
        </h1>

        {/* AVALIAÇÃO */}
        {product.avaliacao && (
          <div className="flex items-center gap-2 text-yellow-500 text-sm">
            ⭐
            <span className="font-medium text-gray-700">
              {product.avaliacao}
            </span>
          </div>
        )}

        {/* CATEGORIAS */}
        {(product.categorias ?? []).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {product.categorias.map((cat, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium"
              >
                {cat}
              </span>
            ))}
          </div>
        )}

        {/* PREÇO */}
        {product.preco !== null && (
          <div className="space-y-1 pt-2">
            <p className="text-3xl sm:text-4xl font-extrabold text-gray-900">
              {product.preco.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>

            <p className="text-sm text-gray-500">
              Melhor preço encontrado
            </p>
          </div>
        )}

        {/* DESCRIÇÃO */}
        {product.descricao && (
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed pt-2">
            {product.descricao}
          </p>
        )}

        {/* BOTÕES */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">

          <a
            href={product.url_afiliada}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 transition text-white font-semibold px-8 py-3 rounded-xl text-center shadow-sm hover:shadow-md"
          >
            Ver oferta
          </a>

          <button
            onClick={onCopyLink}
            className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-3 rounded-xl transition"
          >
            Copiar link
          </button>

        </div>

      </div>
    </div>
  );
}
