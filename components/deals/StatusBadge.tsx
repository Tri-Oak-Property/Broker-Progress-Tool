import { Badge } from "@/components/ui/badge";
import type { DealStatus } from "@/lib/deal-utils";

export function StatusBadge({ status }: { status: DealStatus }) {
  const variantMap: Record<DealStatus, "loi" | "under-contract" | "closed" | "lost" | "draft"> = {
    LOI: "loi",
    "Under Contract": "under-contract",
    Closed: "closed",
    Lost: "lost",
    Draft: "draft",
  };
  return <Badge variant={variantMap[status]}>{status}</Badge>;
}
