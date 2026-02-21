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

  const trendTextColor =
    trend === "queda"
      ? "text-[#F5F138]"
      : trend === "alta"
        ? "text-red-400"
        : "text-[#45C4B0]";

  return (
    <motion.div
      className="mt-10 sm:mt-16"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      viewport={{ once: true }}
    >
      <h2 className="text-xl sm:text-3xl font-bold text-[#9AEBA3] mb-3">
        Histórico de preço
      </h2>

      <p className={`text-sm sm:text-lg font-semibold mb-6 ${trendTextColor}`}>
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

      <div className="bg-[#0b154a] border border-[#45C4B0] rounded-2xl p-4 sm:p-8 shadow-lg">
        <div className="w-full h-56 sm:h-72 lg:h-96 xl:h-[440px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#45C4B0"
                opacity={0.15}
              />

              <XAxis
                dataKey="data"
                tickFormatter={(timestamp: number) =>
                  new Date(timestamp).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                  })
                }
                tick={{ fill: "#45C4B0", fontSize: 16, fontWeight: 700 }}
                minTickGap={25}
                stroke="#45C4B0"
              />

              <YAxis
                width={90}
                domain={[lowerDomain, upperDomain]}
                tickFormatter={(value: number) =>
                  value.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                    maximumFractionDigits: 0,
                  })
                }
                tick={{ fill: "#45C4B0", fontSize: 16, fontWeight: 700 }}
                stroke="#45C4B0"
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: "#000D34",
                  border: "1px solid #45C4B0",
                  borderRadius: "12px",
                  color: "#9AEBA3",
                }}
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
                fill="#F5F138"
                fillOpacity={0.08}
              />

              <Line
                type="stepAfter"
                dataKey="preco"
                stroke="#F5F138"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, fill: "#F5F138" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}
