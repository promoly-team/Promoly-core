"use client";

import Link from "next/link";
import Image from "next/image";
import type { ProductCardData, Deal } from "@/types";

/* ======================================================
   TYPE GUARD
====================================================== */

function isDealProduct(product: ProductCardData): product is Deal {
  return "preco_atual" in product && product.preco_atual !== null;
}

/* ======================================================
   COMPONENT
====================================================== */

type ExtendedProduct = ProductCardData & {
  isBelowAverage?: boolean;
  priceDiffPercent?: number;
};

type Props = {
  product: ExtendedProduct;
  priority?: boolean;
};

export default function ProductCard({ product, priority = false }: Props) {
  const isDeal = isDealProduct(product);

  const productUrl = `/produto/${product.slug}-${product.produto_id}`;

  const showOpportunity =
    product.isBelowAverage || (isDeal && (product.desconto_pct ?? 0) >= 15);

  return (
    <article
      className="
    relative
    bg-[#0a154a]
    rounded-2xl
    border border-[#45C4B0]
    shadow-lg
    hover:shadow-2xl
    transition-all duration-300
    hover:-translate-y-1
    hover:border-[#F5F138]
    p-6
    flex flex-col
    group
  "
    >
      {/* BADGE DESCONTO */}
      {isDeal && product.desconto_pct != null && (
        <span className="absolute top-4 left-4 bg-[#F5F138] text-[#000D34] text-xs font-extrabold px-3 py-1 rounded-full shadow-md z-10">
          -{product.desconto_pct}% OFF
        </span>
      )}

      {/* IMAGEM */}
      <Link
        href={productUrl}
        className="bg-[#000D34] rounded-xl p-4 flex items-center justify-center overflow-hidden"
      >
        <Image
          src={product.imagem_url ?? "/placeholder.png"}
          alt={product.titulo}
          width={500}
          height={500}
          priority={priority}
          loading={priority ? "eager" : "lazy"}
          className="
        w-full
        h-auto
        object-contain
        aspect-[4/5]
        sm:aspect-[3/4]
        scale-110
        group-hover:scale-[1.18]
        transition-transform
        duration-300
      "
          sizes="
        (max-width: 640px) 100vw,
        (max-width: 1024px) 33vw,
        300px
      "
        />
      </Link>

      {/* CONTEÚDO */}
      <div className="mt-6 flex flex-col gap-3 flex-1">
        {/* TÍTULO */}
        <Link
          href={productUrl}
          className="
        text-base
        font-semibold
        text-[#9AEBA3]
        line-clamp-2
        hover:text-[#F5F138]
        transition
      "
        >
          {product.titulo}
        </Link>

        {/* PREÇO */}
        <div className="flex flex-col">
          {isDeal ? (
            <>
              {product.preco_anterior != null && (
                <span className="text-sm text-[#45C4B0] line-through">
                  R$ {Number(product.preco_anterior).toFixed(2)}
                </span>
              )}

              {product.preco_atual != null && (
                <span className="text-3xl font-extrabold text-[#F5F138]">
                  R$ {Number(product.preco_atual).toFixed(2)}
                </span>
              )}
            </>
          ) : (
            <span className="text-3xl font-extrabold text-[#F5F138]">
              {"preco" in product && product.preco != null
                ? `R$ ${Number(product.preco).toFixed(2)}`
                : "Preço indisponível"}
            </span>
          )}
        </div>

        {/* ABAIXO DA MÉDIA */}
        {product.isBelowAverage && product.priceDiffPercent != null && (
          <div className="text-sm text-[#45C4B0] font-bold">
            ⬇ {Math.abs(product.priceDiffPercent).toFixed(1)}% abaixo da média
          </div>
        )}

        {/* BOTÕES */}
        <div className="flex gap-3 mt-4">
          <Link
            href={productUrl}
            className="
          flex-1
          bg-[#DAFDBA]
          hover:bg-[#45C4B0]
          text-[#000D34]
          text-sm
          font-semibold
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
            bg-[#F5F138]
            hover:brightness-95
            text-[#000D34]
            text-sm
            font-bold
            py-2.5
            rounded-xl
            transition
            text-center
          "
            >
              Comprar
            </a>
          )}
        </div>

        {/* BADGE OPORTUNIDADE */}
        {showOpportunity && (
          <span className="absolute bottom- right-4 bg-[#45C4B0] text-[#000D34] text-xs font-extrabold px-3 py-1 rounded-full shadow-md">
            🔥 Oportunidade
          </span>
        )}
      </div>
    </article>
  );
}
