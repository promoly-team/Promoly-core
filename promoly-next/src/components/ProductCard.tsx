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
        bg-panel
        rounded-xl2
        border border-line
        shadow-elevated
        hover:border-success/40
        hover:shadow-glow
        transition-all duration-300
        hover:-translate-y-1
        p-4 sm:p-5
        flex flex-col
        group
      "
    >
      {/* BADGES TOPO */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-start justify-between pointer-events-none">
        {isDeal && product.desconto_pct != null ? (
          <span className="bg-success/15 text-success ring-1 ring-success/30 text-xs font-bold px-2.5 py-1 rounded-full backdrop-blur-sm">
            −{product.desconto_pct}%
          </span>
        ) : (
          <span />
        )}

        {showOpportunity && (
          <span className="bg-accent/15 text-accent ring-1 ring-accent/30 text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm">
            🔥 Oportunidade
          </span>
        )}
      </div>

      {/* IMAGEM */}
      <Link
        href={productUrl}
        className="bg-white rounded-xl p-4 sm:p-5 flex items-center justify-center overflow-hidden"
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
      <div className="mt-4 flex flex-col gap-2 flex-1">
        {/* TÍTULO */}
        <Link
          href={productUrl}
          className="text-sm sm:text-base font-semibold text-white line-clamp-2 hover:text-success transition min-h-[2.5rem]"
        >
          {product.titulo}
        </Link>

        {/* PREÇO */}
        <div className="flex flex-col mt-auto">
          {isDeal ? (
            <>
              {product.preco_anterior != null && (
                <span className="text-xs text-ink-faint line-through">
                  R$ {Number(product.preco_anterior).toFixed(2)}
                </span>
              )}

              {product.preco_atual != null && (
                <span className="text-xl sm:text-2xl font-extrabold text-success">
                  R$ {Number(product.preco_atual).toFixed(2)}
                </span>
              )}
            </>
          ) : (
            <span className="text-xl sm:text-2xl font-extrabold text-ink">
              {"preco" in product && product.preco != null
                ? `R$ ${Number(product.preco).toFixed(2)}`
                : "Preço indisponível"}
            </span>
          )}
        </div>

        {/* ABAIXO DA MÉDIA */}
        {product.isBelowAverage && product.priceDiffPercent != null && (
          <div className="text-xs text-success font-semibold">
            ⬇ {Math.abs(product.priceDiffPercent).toFixed(1)}% abaixo da média
          </div>
        )}

        {/* BOTÕES */}
        <div className="flex gap-2 mt-3">
          <Link
            href={productUrl}
            className="
              flex-1
              bg-panel-subtle
              hover:bg-line
              text-ink-muted hover:text-ink
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
      </div>
    </article>
  );
}
