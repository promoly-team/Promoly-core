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

import { motion } from "framer-motion";

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
  const lastPrice = data[data.length - 1]?.preco ?? 0;
  const previousPrice =
    data.length > 1 ? data[data.length - 2]?.preco : lastPrice;

  let trend: "alta" | "queda" | "estabilidade" = "estabilidade";
  let variationPercent = 0;
  let variationValue = 0;

  if (previousPrice && lastPrice) {
    variationPercent = ((lastPrice - previousPrice) / previousPrice) * 100;

    variationValue = lastPrice - previousPrice;

    if (variationPercent > 0.2) trend = "alta";
    else if (variationPercent < -0.2) trend = "queda";
  }

  const trendColor =
    trend === "queda"
      ? "text-success"
      : trend === "alta"
        ? "text-danger"
        : "text-gray-600";

  const chartColor =
    trend === "queda" ? "#22c177" : trend === "alta" ? "#dc2626" : "#6b7280";

  return (
    <motion.div
      className="mt-8 sm:mt-16"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      viewport={{ once: true }}
    >
      <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-4">
        Histórico de preço
      </h2>

      <p
        className={`text-sm sm:text-lg font-semibold mb-4 sm:mb-6 ${trendColor}`}
      >
        {trend === "queda" && "⬇ "}
        {trend === "alta" && "⬆ "}
        {trend === "estabilidade" && "➖ "}

        {trend === "estabilidade"
          ? "Sem variação relevante"
          : `${Math.abs(variationPercent).toFixed(1)}% 
         (${variationValue > 0 ? "+" : ""}${variationValue.toLocaleString(
           "pt-BR",
           {
             style: "currency",
             currency: "BRL",
           },
         )}) vs último registro`}
      </p>

      <div className="bg-white border border-gray-200 rounded-2xl p-3 sm:p-6 lg:p-8 shadow-soft">
        <div className="w-full h-48 sm:h-64 lg:h-80 xl:h-[420px]">
          <ResponsiveContainer width="100%" height="100%">
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
                tick={{ fontSize: 10 }}
                minTickGap={25}
              />
              <YAxis
                width={80}
                domain={[lowerDomain, upperDomain]}
                tickFormatter={(value: number) =>
                  value.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                    maximumFractionDigits: 0,
                  })
                }
                tick={{ fontSize: 12 }}
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
                labelFormatter={(label) => {
                  const date =
                    typeof label === "number" ? label : Number(label);

                  if (isNaN(date)) return "";
                  return new Date(date).toLocaleDateString("pt-BR");
                }}
              />

              <Area
                type="stepAfter"
                dataKey="preco"
                stroke="none"
                fill={chartColor}
                fillOpacity={0.08}
              />

              <Line
                type="stepAfter"
                dataKey="preco"
                stroke={chartColor}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}
