"use client";

import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/types";

type Props = {
  products: Product[];
};

export default function SimilarProducts({ products }: Props) {
  if (!products || products.length === 0) return null;

  return (
    <aside className="bg-[#DAFDBA] rounded-3xl border border-[#45C4B0] p-6 shadow-lg">
      <h3 className="text-lg font-bold mb-6 text-[#000D34] flex items-center gap-2">
        🔁 Produtos semelhantes
      </h3>

      <div className="flex flex-col gap-4">
        {products.map((p) => (
          <Link
            key={p.produto_id}
            href={`/produto/${p.slug}`}
            className="
              flex gap-4 p-4 rounded-xl
              bg-white
              border border-[#45C4B0]
              hover:bg-[#CFF5A8]
              transition
            "
          >
            {/* IMAGEM */}
            <div className="w-16 h-16 relative flex-shrink-0 bg-white rounded-lg p-2 border border-[#45C4B0]">
              <Image
                src={p.imagem_url ?? "/placeholder.png"}
                alt={p.titulo}
                fill
                className="object-contain"
              />
            </div>

            {/* TEXTO */}
            <div className="flex flex-col gap-1 flex-1">
              <p className="text-sm font-semibold line-clamp-2 text-[#000D34]">
                {p.titulo}
              </p>

              {p.preco !== null && (
                <p className="text-[#000D34] font-bold text-sm">
                  {p.preco.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </aside>
  );
}
