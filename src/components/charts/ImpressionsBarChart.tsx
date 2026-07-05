import { format, parseISO } from "date-fns";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { TimeseriesPoint } from "@/services/api";
import { formatCompact, formatNumber } from "@/lib/format";

interface ImpressionsBarChartProps {
  data: TimeseriesPoint[];
  height?: number;
}

export function ImpressionsBarChart({ data, height = 280 }: ImpressionsBarChartProps) {
  const chartData = data.map((d) => ({ date: d.date, impressions: d.impressions }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 16% 92%)" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={(v) => format(parseISO(v), "MMM d")}
          tick={{ fontSize: 12, fill: "hsl(220 10% 46%)" }}
          axisLine={false}
          tickLine={false}
          minTickGap={24}
        />
        <YAxis
          tickFormatter={(v) => formatCompact(v)}
          tick={{ fontSize: 12, fill: "hsl(220 10% 46%)" }}
          axisLine={false}
          tickLine={false}
          width={48}
        />
        <Tooltip
          cursor={{ fill: "hsl(243 75% 96%)" }}
          contentStyle={{ borderRadius: 12, border: "1px solid hsl(220 16% 90%)", fontSize: 13 }}
          labelFormatter={(v) => format(parseISO(v as string), "EEE, MMM d")}
          formatter={(value) => [formatNumber(value as number), "Impressions"]}
        />
        <Bar dataKey="impressions" fill="hsl(243 75% 62%)" radius={[4, 4, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  );
}
