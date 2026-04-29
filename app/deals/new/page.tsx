export const dynamic = "force-dynamic";
import { getAdvisors } from "@/actions/advisors";
import { DealForm } from "@/components/deals/DealForm";

export default async function NewDealPage() {
  const advisors = await getAdvisors();
  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-slate-900 mb-6">Add Deal</h1>
      <DealForm advisors={advisors} />
    </div>
  );
}
