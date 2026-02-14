import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
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

export default function PriceHistory({
  data,
  lowerDomain,
  upperDomain,
}: Props) {
  return (
    <div className="mt-10 sm:mt-16">
      <h2 className="text-xl sm:text-2xl font-semibold mb-6">
        Histórico do preço
      </h2>

      <div className="bg-white border rounded-2xl p-4 sm:p-6 shadow-sm">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis
              dataKey="data"
              tickFormatter={(timestamp) =>
                new Date(timestamp as number).toLocaleDateString(
                  "pt-BR",
                  { day: "2-digit", month: "2-digit" }
                )
              }
            />

            <YAxis
              width={60}
              domain={[lowerDomain, upperDomain]}
              tickFormatter={(value) =>
                (value as number).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                  maximumFractionDigits: 0,
                })
              }
            />

            <Tooltip
              formatter={(value) =>
                (value as number).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })
              }
              labelFormatter={(label) =>
                new Date(label as number).toLocaleDateString("pt-BR")
              }
            />

            <Line
              type="monotone"
              dataKey="preco"
              stroke="#16a34a"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
