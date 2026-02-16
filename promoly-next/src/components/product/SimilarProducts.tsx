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
    <aside className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 h-fit shadow-sm">

      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        Produtos semelhantes
      </h3>

      <div className="flex flex-col gap-4">

        {products.map((p) => {

          // 🔥 Monta slug + id corretamente
          const productUrl = `/produto/${p.slug}-${p.id}`;

          return (
            <Link
              key={p.id}
              href={productUrl}
              className="flex gap-4 p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition bg-gray-50 hover:bg-white"
            >

              {/* IMAGEM */}
              <div className="w-16 h-16 relative flex-shrink-0 bg-white rounded-lg p-2">
                <Image
                  src={p.imagem_url}
                  alt={p.titulo}
                  fill
                  className="object-contain"
                />
              </div>

              {/* INFO */}
              <div className="flex flex-col gap-1 flex-1">

                <p className="text-sm font-medium text-gray-900 line-clamp-2">
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

                {p.avaliacao && (
                  <p className="text-yellow-500 text-xs">
                    ⭐ {p.avaliacao}
                  </p>
                )}

              </div>
            </Link>
          );
        })}

      </div>

    </aside>
  );
}
