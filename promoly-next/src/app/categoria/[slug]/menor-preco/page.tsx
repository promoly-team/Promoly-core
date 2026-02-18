import { notFound } from "next/navigation";
import type { Metadata } from "next";

import ProductCard from "@/components/ProductCard";
import ProductHistory from "@/components/product/ProductHistory";
import { fetchPrices } from "@/lib/api";
import { fetchProductsWithMetrics } from "@/lib/api";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://promoly-core.vercel.app";

type Props = {
  params: Promise<{ slug: string }>;
};

type ProductWithMetrics = {
  produto_id: number;
  slug: string;
  titulo: string;
  imagem_url: string | null;
  url_afiliada: string | null;
  categoria_slug: string;
  categoria_nome: string;
  current_price: number;
  previous_price: number | null;
  avg_price: number;
  min_price: number;
  max_price: number;
  diff_percent: number;
  variation_vs_last: number | null;
  history: {
    preco: number;
    created_at: string;
  }[];
};

export const revalidate = 300;

/* ===============================================
   METADATA
=============================================== */

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {

  const { slug } = await params;

  const categoriaNome =
    slug.charAt(0).toUpperCase() + slug.slice(1);

  return {
    title: `Menor preço em ${categoriaNome} hoje | Produtos abaixo da média`,
    description:
      `Veja os produtos da categoria ${categoriaNome} que estão abaixo da média histórica.`,
    alternates: {
      canonical: `${BASE_URL}/categoria/${slug}/menor-preco`,
    },
  };
}

/* ===============================================
   PAGE
=============================================== */

export default async function CategoriaMenorPrecoPage(
  { params }: Props
) {

  const { slug } = await params;

  const products: ProductWithMetrics[] =
    await fetchProductsWithMetrics({
      category: slug,
      below_average: true,
      limit: 100,
    });

  if (!products?.length) notFound();

  const sorted = [...products].sort(
    (a, b) => a.diff_percent - b.diff_percent
  );

  const hero = sorted[0];

const heroRawHistory = await fetchPrices(hero.produto_id);

const heroHistory =
  heroRawHistory
    ?.sort(
      (a, b) =>
        new Date(a.created_at).getTime() -
        new Date(b.created_at).getTime()
    )
    .map((h) => ({
      preco: h.preco,
      data: new Date(h.created_at).getTime(),
    })) ?? [];


  const currentPrice = hero.current_price;
  const avgPrice = hero.avg_price;
  const lastPrice = hero.previous_price;

  const diffVsAverageValue = currentPrice - avgPrice;

  const diffVsLastValue =
    lastPrice !== null ? currentPrice - lastPrice : null;

  const variationVsLast =
    lastPrice !== null
      ? ((currentPrice - lastPrice) / lastPrice) * 100
      : null;


  const categoriaNome =
    slug.charAt(0).toUpperCase() + slug.slice(1);

  const today = new Date().toLocaleDateString("pt-BR");

  return (
    <div className="bg-gray-50 min-h-screen">

      <div className="max-w-7xl mx-auto px-6 py-14">

        {/* HEADER */}
        <header className="mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            🔥 Menor preço em {categoriaNome} hoje
          </h1>

          <p className="text-gray-500">
            Produtos abaixo da média histórica.
            Atualizado em {today}
          </p>
        </header>

{/* HERO */}
<section className="bg-white rounded-2xl p-6 md:p-10 shadow border mb-20">

  <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
    🏆 Maior queda da categoria
  </h2>

  {/* GRID IMAGEM + CONTEÚDO */}
  <div className="grid md:grid-cols-2 gap-12">

    {/* IMAGEM */}
    <div>
      <img
        src={hero.imagem_url ?? "/placeholder.png"}
        alt={hero.titulo}
        className="w-full rounded-xl"
      />
    </div>

    {/* CONTEÚDO */}
    <div>

      <h3 className="text-lg md:text-xl font-semibold mb-4">
        {hero.titulo}
      </h3>

      {/* PREÇO ATUAL */}
      <p className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
        {hero.current_price.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })}
      </p>

      {/* BLOCO MÉTRICAS */}
      <div className="grid grid-cols-2 gap-8 mb-8">

        {/* MÉDIA HISTÓRICA */}
        <div>
          <p className="text-xs text-muted uppercase mb-1">
            Média histórica
          </p>
          <p className="font-semibold text-lg">
            {avgPrice.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>
          <p className="text-success font-bold">
            {hero.diff_percent.toFixed(1)}% (
            {diffVsAverageValue.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
            )
          </p>
        </div>

        {/* ÚLTIMO PREÇO */}
        {lastPrice !== null && variationVsLast !== null && diffVsLastValue !== null && (
          <div>
            <p className="text-xs text-muted uppercase mb-1">
              Último preço
            </p>
            <p className="font-semibold text-lg">
              {lastPrice.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>
            <p
              className={`font-bold ${
                variationVsLast > 0
                  ? "text-danger"
                  : "text-success"
              }`}
            >
              {variationVsLast > 0 ? "+" : ""}
              {variationVsLast.toFixed(1)}% (
              {diffVsLastValue.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
              )
            </p>
          </div>
        )}

      </div>

      {/* INFORMATIVO */}
      <h4 className="text-lg md:text-xl font-bold mb-2">
        Histórico de preço
      </h4>

      {variationVsLast !== null && diffVsLastValue !== null && (
        <p
          className={`text-sm mb-6 font-medium ${
            variationVsLast > 0
              ? "text-danger"
              : "text-success"
          }`}
        >
          {variationVsLast > 0 ? "⬆" : "⬇"}{" "}
          {Math.abs(variationVsLast).toFixed(1)}% (
          {Math.abs(diffVsLastValue).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
          ) comparado ao último registro
        </p>
      )}

    </div>

  </div>

  {/* 🔥 GRÁFICO FORA DO GRID (AGORA FICA LARGO NO MOBILE) */}
  <div className="mt-8 max-w-3xl mx-auto">
    <ProductHistory
      data={heroHistory}
      lowerDomain={hero.min_price * 0.9}
      upperDomain={hero.max_price * 1.1}
    />
  </div>

  {/* BOTÕES */}
  <div className="flex gap-4 mt-8">
    <a
      href={`/produto/${hero.slug}-${hero.produto_id}`}
      className="flex-1 bg-surface-subtle hover:bg-gray-200 text-gray-800 py-3 rounded-xl text-center transition"
    >
      Detalhes
    </a>

    {hero.url_afiliada && (
      <a
        href={hero.url_afiliada}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="flex-1 bg-primary hover:bg-primary-hover text-white py-3 rounded-xl text-center transition"
      >
        Comprar
      </a>
    )}
  </div>

</section>


        {/* GRID */}
        <section>

          <h2 className="text-2xl font-bold mb-10">
            Todos abaixo da média
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {sorted.map((p) => (
              <ProductCard
                key={p.produto_id}
                product={{
                  produto_id: p.produto_id,
                  slug: p.slug,
                  titulo: p.titulo,
                  imagem_url: p.imagem_url,
                  url_afiliada: p.url_afiliada,

                  // 👇 ESSENCIAL
                  preco_atual: p.current_price,
                  preco_anterior: p.previous_price,
                  desconto_pct: Math.abs(p.diff_percent),

                  // opcional se quiser mostrar badge abaixo da média
                  isBelowAverage: p.diff_percent < 0,
                  priceDiffPercent: p.diff_percent,
                }}
              />

            ))}
          </div>

        </section>

      </div>
    </div>
  );
}
