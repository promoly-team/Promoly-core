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
    <div className="flex flex-col md:grid md:grid-cols-2 gap-8 md:gap-10 items-start">
      {/* ================= IMAGEM ================= */}
      <div className="bg-[#000D34] border border-[#45C4B0] rounded-3xl p-3 sm:p-6 md:p-8 flex items-center justify-center w-full">
        <Image
          src={product.imagem_url ?? "/placeholder.png"}
          alt={`Imagem do produto ${product.titulo}`}
          width={1500}
          height={1600}
          priority
          className="
      object-contain
      w-full
      h-auto
      max-h-none        /* MOBILE sem limite */
      md:max-h-[420px]  /* Desktop mantém */
      transition-transform
      duration-300
      hover:scale-105
    "
        />
      </div>

      {/* ================= INFORMAÇÕES ================= */}
      <div className="flex flex-col gap-5 w-full">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#9AEBA3] leading-snug">
          {product.titulo}
        </h1>

        {product.preco !== null && (
          <div className="text-3xl sm:text-4xl md:text-4xl font-extrabold text-[#F5F138]">
            {product.preco.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </div>
        )}

        {product.descricao && (
          <p className="text-[#45C4B0] text-sm leading-relaxed">
            {product.descricao}
          </p>
        )}

        {/* ================= BOTÕES ================= */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4 w-full">
          {product.url_afiliada && (
            <a
              href={product.url_afiliada}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="
                w-full
                bg-[#F5F138]
                hover:brightness-95
                text-[#000D34]
                font-bold
                py-3
                rounded-xl
                transition
                shadow-lg
                text-center
              "
            >
              Comprar pelo menor preço
            </a>
          )}

          <button
            onClick={handleCopyLink}
            className="
              w-full
              bg-[#DAFDBA]
              hover:bg-[#45C4B0]
              text-[#000D34]
              font-semibold
              py-3
              rounded-xl
              transition
            "
          >
            Copiar link
          </button>
        </div>
      </div>
    </div>
  );
}
