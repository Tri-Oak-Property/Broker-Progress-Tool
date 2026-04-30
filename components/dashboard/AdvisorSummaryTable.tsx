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
    <div className="rounded-lg border bg-white overflow-hidden" style={{ borderColor: "#E0DDD6" }}>
      <div className="px-5 py-3 border-b" style={{ borderColor: "#E0DDD6" }}>
        <h2 className="font-semibold text-sm" style={{ color: "#1B3A2D" }}>Advisor Pipeline</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b" style={{ borderColor: "#E0DDD6", backgroundColor: "#F5F2EC" }}>
              {["Advisor", "LOI Pipeline", "Current Hopper", "Next 90 Days", "Closed YTD"].map((h) => (
                <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold" style={{ color: "#1B3A2D", opacity: 0.6 }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {active.map(({ advisor, loiPipeline, hopper, next90, closedYtd }) => (
              <tr key={advisor.id} className="border-b last:border-0" style={{ borderColor: "#E0DDD6" }}>
                <td className="px-4 py-2.5 font-medium" style={{ color: "#1B3A2D" }}>
                  <Link href={`/advisors#${advisor.id}`} className="hover:underline">
                    {advisor.firstName} {advisor.lastName}
                  </Link>
                </td>
                <td className="px-4 py-2.5 tabular-nums" style={{ color: "#1B3A2D" }}>{formatCurrency(loiPipeline)}</td>
                <td className="px-4 py-2.5 tabular-nums font-medium" style={{ color: "#1B3A2D" }}>{formatCurrency(hopper)}</td>
                <td className="px-4 py-2.5 tabular-nums text-amber-700">{formatCurrency(next90)}</td>
                <td className="px-4 py-2.5 tabular-nums font-medium text-green-700">{formatCurrency(closedYtd)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2" style={{ borderColor: "#E0DDD6", backgroundColor: "#F5F2EC" }}>
              <td className="px-4 py-2.5 font-semibold text-xs" style={{ color: "#1B3A2D" }}>Total</td>
              <td className="px-4 py-2.5 tabular-nums font-semibold" style={{ color: "#1B3A2D" }}>{formatCurrency(active.reduce((s, r) => s + r.loiPipeline, 0))}</td>
              <td className="px-4 py-2.5 tabular-nums font-semibold" style={{ color: "#1B3A2D" }}>{formatCurrency(active.reduce((s, r) => s + r.hopper, 0))}</td>
              <td className="px-4 py-2.5 tabular-nums font-semibold text-amber-700">{formatCurrency(active.reduce((s, r) => s + r.next90, 0))}</td>
              <td className="px-4 py-2.5 tabular-nums font-semibold text-green-700">{formatCurrency(active.reduce((s, r) => s + r.closedYtd, 0))}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
