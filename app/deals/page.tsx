export const dynamic = "force-dynamic";
import { getDeals } from "@/actions/deals";
import { getAdvisors } from "@/actions/advisors";
import { DealsTable } from "@/components/deals/DealsTable";

export default async function DealsPage() {
  const [deals, advisors] = await Promise.all([getDeals(), getAdvisors()]);
  return (
    <div className="px-4 py-6">
      <h1 className="text-xl font-bold text-slate-900 mb-6">Deals</h1>
      <DealsTable deals={deals as Parameters<typeof DealsTable>[0]["deals"]} advisors={advisors} />
    </div>
  );
}
