"use client";

import Image from "next/image";
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
    <div className="grid md:grid-cols-2 gap-8 items-start">
      {/* IMAGEM */}
      <div className="bg-surface-subtle rounded-3xl p-6 flex items-center justify-center">
        <Image
          src={product.imagem_url ?? "/placeholder.png"}
          alt={`Imagem do produto ${product.titulo}`}
          width={1200}
          height={1200}
          priority
          className="object-contain w-full h-auto max-h-[420px]"
        />
      </div>

      {/* INFORMAÇÕES */}
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-gray-900 leading-snug">
          {product.titulo}
        </h1>

        {product.preco !== null && (
          <div className="text-3xl font-bold text-primary">
            {product.preco.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </div>
        )}

        {product.descricao && (
          <p className="text-gray-700 text-sm leading-relaxed">
            {product.descricao}
          </p>
        )}

        <div className="flex gap-3 mt-4 flex-wrap">
          {product.url_afiliada && (
            <a
              href={product.url_afiliada}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="
                bg-primary
                hover:bg-primary-hover
                text-white
                font-semibold
                px-6
                py-2.5
                rounded-xl2
                transition
                shadow-soft
              "
            >
              Comprar pelo menor preço
            </a>
          )}

          <button
            onClick={handleCopyLink}
            className="
              bg-surface-subtle
              text-gray-800
              hover:bg-gray-200
              px-5
              py-2.5
              rounded-xl2
              transition
              shadow-soft
            "
          >
            Copiar link
          </button>
        </div>
      </div>
    </div>
  );
}
