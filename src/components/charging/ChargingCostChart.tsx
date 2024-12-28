import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { format } from "date-fns";

type ChargingSession = {
  date: string;
  cost: number;
};

export function ChargingCostChart({ data }: { data: ChargingSession[] }) {
  // Sort data by date and format for the chart
  const chartData = [...data]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((session) => ({
      date: format(new Date(session.date), "MMM d"),
      cost: session.cost,
    }));

  return (
    <ChartContainer className="h-[300px]" config={{ cost: { color: "#0066FF" } }}>
      <LineChart data={chartData}>
        <XAxis
          dataKey="date"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <ChartTooltip />
        <Line
          type="monotone"
          dataKey="cost"
          stroke="var(--color-cost)"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ChartContainer>
  );
}