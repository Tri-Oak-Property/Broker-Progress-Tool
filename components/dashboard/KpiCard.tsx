import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string;
  sub?: string;
  accent?: "default" | "green" | "amber" | "blue" | "red";
}

const accentMap = {
  default: "#1B3A2D",
  green:   "#1B3A2D",
  amber:   "#92400e",
  blue:    "#1e40af",
  red:     "#dc2626",
};

export function KpiCard({ title, value, sub, accent = "default" }: KpiCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold" style={{ color: accentMap[accent] }}>{value}</p>
        {sub && <p className="text-xs mt-1" style={{ color: "#1B3A2D", opacity: 0.5 }}>{sub}</p>}
      </CardContent>
    </Card>
  );
}
