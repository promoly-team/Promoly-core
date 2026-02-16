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
  return (
    <div className="mt-10 sm:mt-16">
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6">
        Histórico do preço
      </h2>

      <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-6 shadow-sm">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>

            {/* GRID SUAVE */}
            <CartesianGrid
              strokeDasharray="4 4"
              stroke="#e5e7eb"
            />

            {/* EIXO X */}
            <XAxis
              dataKey="data"
              tick={{ fill: "#6b7280", fontSize: 12 }}
              tickFormatter={(timestamp: number) =>
                new Date(timestamp).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                })
              }
            />

            {/* EIXO Y */}
            <YAxis
              width={70}
              domain={[lowerDomain, upperDomain]}
              tick={{ fill: "#6b7280", fontSize: 12 }}
              tickFormatter={(value: number) =>
                value.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                  maximumFractionDigits: 0,
                })
              }
            />

            {/* TOOLTIP REFINADO */}
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                borderRadius: "12px",
                border: "1px solid #e5e7eb",
                fontSize: "14px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
              labelStyle={{
                color: "#111827",
                fontWeight: 600,
                marginBottom: "4px",
              }}
              itemStyle={{
                color: "#16a34a",
                fontWeight: 500,
              }}

              formatter={(value: number | undefined) =>
                value != null
                  ? value.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })
                  : ""
              }

              labelFormatter={(label: number) =>
                new Date(label).toLocaleDateString("pt-BR")
              }
            />

            {/* ÁREA */}
            <Area
              type="monotone"
              dataKey="preco"
              stroke="none"
              fill="#16a34a"
              fillOpacity={0.08}
              tooltipType="none"
            />

            {/* LINHA PRINCIPAL */}
            <Line
              type="monotone"
              dataKey="preco"
              stroke="#16a34a"
              strokeWidth={3}
              dot={{ r: 5, fill: "#16a34a" }}
              activeDot={{ r: 7 }}
            />

          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
