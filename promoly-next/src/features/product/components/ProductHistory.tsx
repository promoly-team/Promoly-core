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
        : "text-ink-muted";

  const chartColor =
    trend === "queda" ? "#22c55e" : trend === "alta" ? "#ef4444" : "#94a3b8";

  const gradientId = `priceGradient-${trend}`;

  return (
    <motion.div
      className="mt-8 sm:mt-16"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      viewport={{ once: true }}
    >
      <h2 className="text-lg sm:text-2xl font-bold text-ink mb-2 sm:mb-4">
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

      <div className="bg-panel-subtle border border-line rounded-2xl p-3 sm:p-6 lg:p-8">
        <div className="w-full h-48 sm:h-64 lg:h-80 xl:h-[420px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chartColor} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#1f2a3d" vertical={false} />

              <XAxis
                dataKey="data"
                tickFormatter={(timestamp: number) =>
                  new Date(timestamp).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                  })
                }
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                axisLine={{ stroke: "#1f2a3d" }}
                tickLine={false}
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
                tick={{ fontSize: 12, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip
                cursor={{ stroke: chartColor, strokeWidth: 1, strokeDasharray: "4 4" }}
                contentStyle={{
                  background: "#161d2e",
                  border: "1px solid #1f2a3d",
                  borderRadius: "0.75rem",
                  color: "#f1f5f9",
                  boxShadow: "0 10px 40px rgba(0,0,0,0.45)",
                }}
                labelStyle={{ color: "#94a3b8", marginBottom: 4 }}
                itemStyle={{ color: "#f1f5f9" }}
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
                fill={`url(#${gradientId})`}
              />

              <Line
                type="stepAfter"
                dataKey="preco"
                stroke={chartColor}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}
