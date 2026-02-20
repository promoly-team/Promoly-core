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
        bg-surface
        rounded-xl2
        border border-gray-200
        shadow-soft
        hover:shadow-medium
        transition-all duration-300
        hover:-translate-y-1
        p-6
        flex flex-col
        group
      "
    >
      {/* BADGE DESCONTO */}
      {isDeal && product.desconto_pct != null && (
        <span className="absolute top-4 left-4 bg-success text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
          -{product.desconto_pct}% de queda
        </span>
      )}

      {/* IMAGEM */}
      <Link
        href={productUrl}
        className="bg-surface-subtle rounded-xl p-4 sm:p-6 flex items-center justify-center overflow-hidden"
      >
        <Image
          src={product.imagem_url ?? "/placeholder.png"}
          alt={product.titulo}
          width={500}
          height={500}
          priority={priority}
          loading={priority ? "eager" : "lazy"}
          className="w-full h-auto object-contain aspect-[4/5] sm:aspect-[3/4] group-hover:scale-105 transition-transform duration-300"
          sizes="
      (max-width: 640px) 50vw,
      (max-width: 1024px) 33vw,
      300px
    "
        />
      </Link>

      {/* CONTEÚDO */}
      <div className="mt-5 flex flex-col gap-3 flex-1">
        {/* TÍTULO */}
        <Link
          href={productUrl}
          className="text-base font-semibold text-gray-900 line-clamp-2 hover:text-primary transition"
        >
          {product.titulo}
        </Link>

        {/* PREÇO */}
        <div className="flex flex-col">
          {isDeal ? (
            <>
              {product.preco_anterior != null && (
                <span className="text-sm text-muted line-through">
                  R$ {Number(product.preco_anterior).toFixed(2)}
                </span>
              )}

              {product.preco_atual != null && (
                <span className="text-2xl font-bold text-success">
                  R$ {Number(product.preco_atual).toFixed(2)}
                </span>
              )}
            </>
          ) : (
            <span className="text-2xl font-bold text-primary">
              {"preco" in product && product.preco != null
                ? `R$ ${Number(product.preco).toFixed(2)}`
                : "Preço indisponível"}
            </span>
          )}
        </div>

        {/* ABAIXO DA MÉDIA */}
        {product.isBelowAverage && product.priceDiffPercent != null && (
          <div className="text-base text-success font-semibold">
            ⬇ {Math.abs(product.priceDiffPercent).toFixed(1)}% abaixo da média
          </div>
        )}

        {/* BOTÕES */}
        <div className="flex gap-3 mt-4">
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
              Comprar
            </a>
          )}
        </div>

        {/* BADGE OPORTUNIDADE */}
        {showOpportunity && (
          <span className="absolute bottom-0 right-4 bg-accent text-black text-xs font-semibold px-3 py-1 rounded-full shadow">
            🔥 Oportunidade
          </span>
        )}
      </div>
    </article>
  );
}
