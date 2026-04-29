import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { getDealStatus, toNum } from "@/lib/deal-utils";
import type { Deal, Advisor } from "@/lib/db/schema";

type DealWithAdvisor = Deal & { advisor: Advisor };

export function AdvisorSummaryTable({
  deals,
  advisors,
}: {
  deals: DealWithAdvisor[];
  advisors: Advisor[];
}) {
  const rows = advisors.map((advisor) => {
    const myDeals = deals.filter((d) => d.advisorId === advisor.id);

    let loiPipeline = 0;
    let hopper = 0;
    let next90 = 0;
    let closedYtd = 0;

    const now = new Date();
    const future90 = new Date();
    future90.setDate(now.getDate() + 90);
    now.setHours(0, 0, 0, 0);

    for (const d of myDeals) {
      const status = getDealStatus(d);
      if (status === "LOI") loiPipeline += toNum(d.loiExpectedCommission);
      if (status === "Under Contract") {
        const amt = toNum(d.hopperGainAmount);
        hopper += amt;
        if (d.expectedCloseDate) {
          const cd = new Date(d.expectedCloseDate + "T12:00:00");
          if (cd >= now && cd <= future90) next90 += amt;
        }
      }
      if (status === "Closed") {
        const closed = new Date(d.closedDate! + "T12:00:00");
        if (closed.getFullYear() === now.getFullYear()) closedYtd += toNum(d.closedCommission);
      }
    }

    return { advisor, loiPipeline, hopper, next90, closedYtd };
  });

  const active = rows.filter((r) => r.advisor.active);

  return (
    <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-200">
        <h2 className="font-semibold text-slate-900 text-sm">Advisor Pipeline</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              {["Advisor", "LOI Pipeline", "Current Hopper", "Next 90 Days", "Closed YTD"].map((h) => (
                <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {active.map(({ advisor, loiPipeline, hopper, next90, closedYtd }) => (
              <tr key={advisor.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-2.5 font-medium text-slate-900">
                  <Link href={`/advisors#${advisor.id}`} className="hover:underline">
                    {advisor.firstName} {advisor.lastName}
                  </Link>
                </td>
                <td className="px-4 py-2.5 tabular-nums text-slate-700">{formatCurrency(loiPipeline)}</td>
                <td className="px-4 py-2.5 tabular-nums text-slate-900 font-medium">{formatCurrency(hopper)}</td>
                <td className="px-4 py-2.5 tabular-nums text-amber-700">{formatCurrency(next90)}</td>
                <td className="px-4 py-2.5 tabular-nums text-green-700 font-medium">{formatCurrency(closedYtd)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-200 bg-slate-50">
              <td className="px-4 py-2.5 font-semibold text-slate-900 text-xs">Total</td>
              <td className="px-4 py-2.5 tabular-nums font-semibold text-slate-700">{formatCurrency(active.reduce((s, r) => s + r.loiPipeline, 0))}</td>
              <td className="px-4 py-2.5 tabular-nums font-semibold text-slate-900">{formatCurrency(active.reduce((s, r) => s + r.hopper, 0))}</td>
              <td className="px-4 py-2.5 tabular-nums font-semibold text-amber-700">{formatCurrency(active.reduce((s, r) => s + r.next90, 0))}</td>
              <td className="px-4 py-2.5 tabular-nums font-semibold text-green-700">{formatCurrency(active.reduce((s, r) => s + r.closedYtd, 0))}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
