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
    <div className="flex flex-col sm:flex-row gap-4 mb-12">
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
        w-full sm:w-72
        px-4 py-3
        bg-[#0a154a]
        border border-[#45C4B0]
        rounded-xl
        text-[#9AEBA3]
        placeholder:text-[#45C4B0]
        font-semibold
        focus:outline-none
        focus:ring-2
        focus:ring-[#F5F138]
        focus:border-[#F5F138]
        transition
      "
      />

      {/* ================= FILTRO ================= */}
      <select
        value={currentOrder}
        onChange={(e) => updateParams({ order: e.target.value })}
        className="
        px-4 py-3
        bg-[#0a154a]
        border border-[#45C4B0]
        rounded-xl
        text-[#9AEBA3]
        font-semibold
        focus:outline-none
        focus:ring-2
        focus:ring-[#F5F138]
        focus:border-[#F5F138]
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
