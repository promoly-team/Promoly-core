import type { Product } from "../../types";

type Props = {
  products: Product[];
};

export default function SimilarProducts({ products }: Props) {
  if (products.length === 0) return null;

  return (
    <aside className="bg-gray-50 rounded-2xl p-4 sm:p-6 h-fit">
      <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6">
        Produtos semelhantes
      </h3>

      <div className="flex flex-col gap-4">
        {products.map((p, index) => (
          <div
            key={`${p.produto_id}-${index}`}
            onClick={() =>
              (window.location.href = `/produto/${p.produto_id}`)
            }
            className="flex gap-3 p-3 sm:p-4 bg-white rounded-xl cursor-pointer hover:shadow-md transition"
          >
            <img
              src={p.imagem_url}
              alt={p.titulo}
              className="w-14 h-14 sm:w-16 sm:h-16 object-contain bg-white p-2 rounded-lg"
            />

            <div className="flex flex-col gap-1">
              <div className="text-xs sm:text-sm font-medium line-clamp-2">
                {p.titulo}
              </div>

              {p.preco !== null && (
                <div className="font-bold text-blue-600 text-sm">
                  {p.preco.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </div>
              )}

              {p.avaliacao && (
                <div className="text-yellow-500 text-xs">
                  ⭐ {p.avaliacao}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
