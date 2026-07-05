import { format, parseISO } from "date-fns";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TimeseriesPoint } from "@/services/api";
import { formatCompact, formatCurrency } from "@/lib/format";

interface RevenueAreaChartProps {
  data: TimeseriesPoint[];
  height?: number;
}

/** Revenue (area, left axis) with impressions (line, right axis). */
export function RevenueAreaChart({ data, height = 320 }: RevenueAreaChartProps) {
  const chartData = data.map((d) => ({
    date: d.date,
    revenue: d.revenueCents / 100,
    impressions: d.impressions,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(152 60% 45%)" stopOpacity={0.28} />
            <stop offset="100%" stopColor="hsl(152 60% 45%)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
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
          yAxisId="rev"
          tickFormatter={(v) => `$${v}`}
          tick={{ fontSize: 12, fill: "hsl(220 10% 46%)" }}
          axisLine={false}
          tickLine={false}
          width={52}
        />
        <YAxis
          yAxisId="imp"
          orientation="right"
          tickFormatter={(v) => formatCompact(v)}
          tick={{ fontSize: 12, fill: "hsl(220 10% 46%)" }}
          axisLine={false}
          tickLine={false}
          width={48}
        />
        <Tooltip
          contentStyle={{ borderRadius: 12, border: "1px solid hsl(220 16% 90%)", fontSize: 13 }}
          labelFormatter={(v) => format(parseISO(v as string), "EEE, MMM d")}
          formatter={(value, name) =>
            name === "revenue"
              ? [formatCurrency((value as number) * 100), "Revenue"]
              : [formatCompact(value as number), "Impressions"]
          }
        />
        <Area
          yAxisId="rev"
          type="monotone"
          dataKey="revenue"
          stroke="hsl(152 60% 40%)"
          strokeWidth={2}
          fill="url(#revFill)"
        />
        <Line
          yAxisId="imp"
          type="monotone"
          dataKey="impressions"
          stroke="hsl(243 75% 59%)"
          strokeWidth={2}
          dot={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
