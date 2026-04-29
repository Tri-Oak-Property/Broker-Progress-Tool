export const dynamic = "force-dynamic";
import { notFound } from "next/navigation";
import { getAdvisors } from "@/actions/advisors";
import { getDeal } from "@/actions/deals";
import { DealForm } from "@/components/deals/DealForm";

export default async function EditDealPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [advisors, deal] = await Promise.all([getAdvisors(), getDeal(id)]);
  if (!deal) notFound();
  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-slate-900 mb-6">Edit Deal</h1>
      <DealForm advisors={advisors} deal={deal} />
    </div>
  );
}
