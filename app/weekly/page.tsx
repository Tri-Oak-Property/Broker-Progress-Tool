export const dynamic = "force-dynamic";
import { getDeals } from "@/actions/deals";
import { WeeklyFlowTable } from "@/components/weekly/WeeklyFlowTable";
import type { Deal } from "@/lib/db/schema";

export default async function WeeklyPage() {
  const deals = await getDeals();
  return (
    <div className="px-4 py-6">
      <h1 className="text-xl font-bold text-slate-900 mb-6">Weekly Flow</h1>
      <WeeklyFlowTable deals={deals as Deal[]} />
    </div>
  );
}
