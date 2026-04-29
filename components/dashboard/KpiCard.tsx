import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string;
  sub?: string;
  accent?: "default" | "green" | "amber" | "blue" | "red";
}

const accentMap = {
  default: "text-slate-900",
  green: "text-green-700",
  amber: "text-amber-700",
  blue: "text-blue-700",
  red: "text-red-600",
};

export function KpiCard({ title, value, sub, accent = "default" }: KpiCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className={cn("text-2xl font-bold", accentMap[accent])}>{value}</p>
        {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}
