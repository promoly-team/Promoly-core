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
    <aside className="bg-white rounded-3xl border border-gray-200 p-6 shadow-md">

      <h3 className="text-lg font-semibold mb-6 text-gray-600 flex items-center gap-2">
        🔁 Produtos semelhantes
      </h3>

      <div className="flex flex-col gap-5">

        {products.map((p) => (
          <Link
            key={p.produto_id}
            href={`/produto/${p.slug}`}
            className="flex gap-4 p-4 rounded-xl hover:shadow-md transition border border-gray-100 hover:border-gray-200 bg-gray-50 hover:bg-white"
          >

            <div className="w-16 h-16 relative flex-shrink-0 bg-white rounded-lg p-2">
              <Image
                src={p.imagem_url ?? "/placeholder.png"}
                alt={p.titulo}
                fill
                className="object-contain"
              />
            </div>

            <div className="flex flex-col gap-1 flex-1">
              <p className="text-sm font-medium line-clamp-2 text-gray-600">
                {p.titulo}
              </p>

              {p.preco !== null && (
                <p className="text-blue-600 font-semibold text-sm">
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
