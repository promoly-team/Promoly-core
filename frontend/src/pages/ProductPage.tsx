import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchProduct, fetchPrices } from "../services/api";
import type { Product } from "../../../promoly-next/src/types";

import ProductDetails from "../components/product/ProductDetails";
import PriceHistory from "../components/product/ProductHistory";
import SimilarProducts from "../components/product/SimilarProducts";

type PriceHistoryItem = {
  preco: number;
  data: number;
};

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();

  const [product, setProduct] = useState<Product | null>(null);
  const [similares, setSimilares] = useState<Product[]>([]);
  const [priceHistory, setPriceHistory] = useState<PriceHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    setError(null);

    Promise.all([
      fetchProduct(Number(id)),
      fetchPrices(Number(id)),
    ])
      .then(([productData, prices]) => {
        setProduct(productData.produto);

        setSimilares(
          productData.similares.map((p: any) => ({
            ...p,
            produto_id: p.id,
          }))
        );

        const normalized: PriceHistoryItem[] = prices
          .map((p: any) => ({
            preco: p.preco,
            data: new Date(p.created_at).getTime(),
          }))
          .sort((a, b) => a.data - b.data);

        setPriceHistory(normalized);
      })
      .catch(() => {
        setError("Não foi possível carregar o produto");
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <p className="text-gray-500">Carregando produto...</p>
      </div>
    );

  if (error)
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <p className="text-red-500">{error}</p>
      </div>
    );

  if (!product)
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <p className="text-gray-500">Produto não encontrado.</p>
      </div>
    );

  /* =========================
     MÉTRICAS
  ========================= */

  const maxPrice =
    priceHistory.length > 0
      ? Math.max(...priceHistory.map((p) => p.preco))
      : 0;

  const minPrice =
    priceHistory.length > 0
      ? Math.min(...priceHistory.map((p) => p.preco))
      : 0;

  const avgPrice =
    priceHistory.length > 1
      ? priceHistory.reduce((acc, p) => acc + p.preco, 0) /
        priceHistory.length
      : 0;

  const currentPrice =
    priceHistory.length > 0
      ? priceHistory[priceHistory.length - 1].preco
      : 0;

  const isBelowAverage =
    priceHistory.length > 1 && currentPrice < avgPrice;

  const padding = Math.max(maxPrice * 0.05, 20);
  const upperDomain = maxPrice + padding;
  const lowerDomain = Math.max(0, minPrice - padding);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid lg:grid-cols-[2fr_1fr] gap-10">

        {/* ================= MAIN ================= */}
        <section className="space-y-8">

          {/* CARD PRINCIPAL */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
            <ProductDetails
              product={product}
              onCopyLink={copyLink}
            />
          </div>

          {/* ================= ANÁLISE DE PREÇO ================= */}

          {/* CASO TENHA 2 OU MAIS REGISTROS */}
          {priceHistory.length > 1 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">

              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Análise de preço
              </h3>

              <div className="grid sm:grid-cols-3 gap-5">

                {/* MENOR PREÇO */}
                <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-200">
                  <p className="text-sm text-emerald-700 mb-2 font-medium">
                    📉 Menor preço histórico
                  </p>
                  <p className="text-xl font-bold text-emerald-800">
                    {minPrice.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </p>
                </div>

                {/* MAIOR PREÇO */}
                <div className="bg-red-50 rounded-2xl p-5 border border-red-200">
                  <p className="text-sm text-red-600 mb-2 font-medium">
                    📈 Maior preço histórico
                  </p>
                  <p className="text-xl font-bold text-red-700">
                    {maxPrice.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </p>
                </div>

                {/* MÉDIA */}
                <div
                  className={`rounded-2xl p-5 border ${
                    isBelowAverage
                      ? "bg-emerald-50 border-emerald-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <p
                    className={`text-sm mb-2 font-medium ${
                      isBelowAverage
                        ? "text-emerald-700"
                        : "text-red-600"
                    }`}
                  >
                    💰 Preço atual vs média
                  </p>

                  <p
                    className={`text-xl font-bold ${
                      isBelowAverage
                        ? "text-emerald-800"
                        : "text-red-700"
                    }`}
                  >
                    {isBelowAverage
                      ? "Abaixo da média"
                      : "Acima da média"}
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    Média:{" "}
                    {avgPrice.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </p>
                </div>

              </div>
            </div>
          )}

          {/* CASO TENHA APENAS 1 REGISTRO */}
          {priceHistory.length === 1 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Análise de preço
              </h3>

              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center">
                <p className="text-gray-600 text-sm">
                  📊 Ainda não há histórico suficiente para análise estatística.
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  O produto possui apenas um registro de preço.
                </p>
              </div>
            </div>
          )}

          {/* ================= HISTÓRICO ================= */}
          {priceHistory.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
              <PriceHistory
                data={priceHistory}
                lowerDomain={lowerDomain}
                upperDomain={upperDomain}
              />
            </div>
          )}

        </section>

        {/* ================= ASIDE ================= */}
        <aside>
          <div className="sticky top-24">
            <SimilarProducts products={similares} />
          </div>
        </aside>

      </div>
    </div>
  );
}
