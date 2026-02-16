"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
} from "recharts";

type PriceHistoryItem = {
  preco: number;
  data: number;
};

type Props = {
  data: PriceHistoryItem[];
  lowerDomain: number;
  upperDomain: number;
};

export default function ProductHistory({
  data,
  lowerDomain,
  upperDomain,
}: Props) {

  const firstPrice = data[0]?.preco ?? 0;
  const lastPrice = data[data.length - 1]?.preco ?? 0;

  let trend: "alta" | "queda" | "estabilidade" = "estabilidade";
  let variation = 0;

  if (firstPrice && lastPrice) {
    variation = ((lastPrice - firstPrice) / firstPrice) * 100;

    if (variation > 0) trend = "alta";
    else if (variation < 0) trend = "queda";
  }

  const isOpportunity = trend === "queda" && Math.abs(variation) >= 5;

  const trendColor =
    trend === "queda"
      ? "text-emerald-600"
      : trend === "alta"
      ? "text-red-600"
      : "text-gray-600";

  const chartColor =
    trend === "queda"
      ? "#16a34a"
      : trend === "alta"
      ? "#dc2626"
      : "#6b7280";

  return (
    <div className="mt-10 sm:mt-16">

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <h2 className="text-2xl font-bold text-gray-900">
          Histórico de preço e variação ao longo do tempo
        </h2>

        {isOpportunity && (
          <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full">
            🔥 Oportunidade
          </span>
        )}
      </div>

      <p className={`mb-6 font-medium ${trendColor}`}>
        {trend === "queda" && (
          <>
            📉 O produto apresentou uma queda de{" "}
            {Math.abs(variation).toFixed(1)}% no período analisado.
            {isOpportunity &&
              " Essa variação indica uma possível excelente oportunidade de compra."}
          </>
        )}

        {trend === "alta" && (
          <>
            📈 O produto apresentou uma alta de{" "}
            {Math.abs(variation).toFixed(1)}% no período analisado,
            indicando tendência de valorização.
          </>
        )}

        {trend === "estabilidade" && (
          <>
            ➖ O preço manteve estabilidade no período analisado,
            sem variações relevantes.
          </>
        )}
      </p>

      <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-6 shadow-sm">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>

            <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" />

            <XAxis
              dataKey="data"
              tickFormatter={(timestamp: number) =>
                new Date(timestamp).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                })
              }
            />

            <YAxis
              width={70}
              domain={[lowerDomain, upperDomain]}
              tickFormatter={(value: number) =>
                value.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                  maximumFractionDigits: 0,
                })
              }
            />

            <Tooltip
              formatter={(value: number | undefined) =>
                value != null
                  ? value.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })
                  : ""
              }
            />

            <Area
              type="monotone"
              dataKey="preco"
              stroke="none"
              fill={chartColor}
              fillOpacity={0.08}
            />

            <Line
              type="monotone"
              dataKey="preco"
              stroke={chartColor}
              strokeWidth={3}
            />

          </LineChart>
        </ResponsiveContainer>
      </div>

      <p className="text-gray-600 mt-6">
        A análise do comportamento histórico ajuda a entender
        se o preço atual representa uma boa oportunidade de compra.
      </p>

    </div>
  );
}
