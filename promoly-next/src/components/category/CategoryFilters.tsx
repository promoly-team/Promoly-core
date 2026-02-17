"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function CategoryFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSearch = searchParams.get("search") || "";
  const currentOrder = searchParams.get("order") || "desconto";

  const [search, setSearch] = useState(currentSearch);

  function updateParams(newParams: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(newParams).forEach(([key, value]) => {
      params.set(key, value);
    });

    // Sempre resetar para página 1 ao aplicar filtro
    params.set("page", "1");

    router.push(`?${params.toString()}`);
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-10">

      {/* ================= BUSCA ================= */}
      <input
        type="text"
        placeholder="Buscar produto..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            updateParams({ search });
          }
        }}
        className="
          w-full sm:w-64
          px-4 py-3
          bg-white
          border border-gray-200
          rounded-xl
          shadow-sm
          text-[#2563eb]
          placeholder:text-blue-400
          focus:outline-none
          focus:ring-2
          focus:ring-[#2563eb]
          transition
        "
      />

      {/* ================= FILTRO ================= */}
      <select
        value={currentOrder}
        onChange={(e) =>
          updateParams({ order: e.target.value })
        }
        className="
          px-4 py-3
          bg-white
          border border-gray-200
          rounded-xl
          shadow-sm
          text-[#2563eb]
          focus:outline-none
          focus:ring-2
          focus:ring-[#2563eb]
          transition
        "
      >
        <option value="desconto">Maior desconto</option>
        <option value="preco">Menor preço</option>
        <option value="recentes">Mais recentes</option>
      </select>

    </div>
  );
}
