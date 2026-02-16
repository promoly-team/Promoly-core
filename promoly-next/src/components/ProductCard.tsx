"use client";

import Link from "next/link";
import type { ProductCardData } from "@/types";

type Props = {
  product: ProductCardData;
};

export default function ProductCard({ product }: Props) {
  const isDeal = "preco_atual" in product;
  const productUrl = `/produto/${product.slug}-${product.produto_id}`;

  return (
    <div className="
      relative
      bg-surface
      rounded-xl2
      border border-gray-200
      shadow-soft
      hover:shadow-medium
      transition
      p-5
      flex flex-col
      group
    ">

      {/* BADGE DESCONTO */}
      {isDeal && product.desconto_pct != null && (
        <span className="
          absolute top-4 left-4 z-20
          bg-success
          text-white
          text-xs
          font-semibold
          px-3 py-1
          rounded-full
          shadow
        ">
          -{product.desconto_pct}%
        </span>
      )}

      {/* IMAGEM */}
      <Link
        href={productUrl}
        className="
          bg-surface-subtle
          rounded-xl
          p-6
          flex items-center justify-center
          overflow-hidden
        "
      >
        <img
          src={product.imagem_url ?? "/placeholder.png"}
          alt={product.titulo}
          className="
            h-36
            object-contain
            transition-transform duration-300
            group-hover:scale-105
          "
        />
      </Link>

      {/* CONTEÚDO */}
      <div className="mt-5 flex flex-col gap-3 flex-1">

        {/* TÍTULO */}
        <Link
          href={productUrl}
          className="
            text-sm
            font-semibold
            text-gray-900
            line-clamp-2
            hover:text-primary
            transition
            min-h-[40px]
          "
        >
          {product.titulo}
        </Link>

        {/* PREÇOS */}
        <div className="flex flex-col">

          {isDeal ? (
            <>
              {product.preco_anterior != null && (
                <span className="text-xs text-muted line-through">
                  R$ {product.preco_anterior.toFixed(2)}
                </span>
              )}

              {product.preco_atual != null && (
                <span className="text-xl font-bold text-success">
                  R$ {product.preco_atual.toFixed(2)}
                </span>
              )}
            </>
          ) : (
            <span className="text-xl font-bold text-primary">
              {"preco" in product && product.preco != null
                ? `R$ ${product.preco.toFixed(2)}`
                : "Preço indisponível"}
            </span>
          )}
        </div>

        {/* BOTÕES */}
        <div className="flex gap-3 mt-auto">

          <Link
            href={productUrl}
            className="
              flex-1
              bg-surface-subtle
              hover:bg-gray-200
              text-gray-800
              text-sm
              font-medium
              py-2.5
              rounded-xl
              transition
              text-center
            "
          >
            Detalhes
          </Link>

          {product.url_afiliada && (
            <a
              href={product.url_afiliada}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="
                flex-1
                bg-primary
                hover:bg-primary-hover
                text-white
                text-sm
                font-semibold
                py-2.5
                rounded-xl
                transition
                text-center
              "
            >
              Ver oferta
            </a>
          )}

        </div>
      </div>
    </div>
  );
}
