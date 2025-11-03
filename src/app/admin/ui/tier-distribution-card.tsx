"use client";
// Σχόλιο (GR): Κάρτα με γράφημα κατανομής tier για το admin dashboard
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  LabelList,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type TierDataPoint = {
  tier: number;
  count: number;
};

export default function TierDistributionCard({
  data,
  total,
  pending,
}: {
  data: TierDataPoint[];
  total: number;
  pending: number;
}) {
  const chartData = data.map((item) => ({
    tierLabel: `Tier ${item.tier}`,
    count: item.count,
  }));
  const hasData = total > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Κατανομή Tier</CardTitle>
        <CardDescription>
          Συνολικές αξιολογήσεις: {total} · Εκκρεμείς: {pending}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          {hasData ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="tierLabel" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#0ea5e9" radius={[6, 6, 0, 0]}>
                  <LabelList dataKey="count" position="top" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Δεν υπάρχουν ακόμη ολοκληρωμένες αξιολογήσεις.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
