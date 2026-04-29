export const dynamic = "force-dynamic";
import Link from "next/link";
import { getDeals } from "@/actions/deals";
import { getAdvisors } from "@/actions/advisors";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { AdvisorSummaryTable } from "@/components/dashboard/AdvisorSummaryTable";
import { Button } from "@/components/ui/button";
import { computeMetrics, getWeekBounds } from "@/lib/deal-utils";
import { formatCurrency } from "@/lib/utils";
import { Plus } from "lucide-react";
import type { Deal, Advisor } from "@/lib/db/schema";

export default async function DashboardPage() {
  const [deals, advisors] = await Promise.all([getDeals(), getAdvisors()]);
  const { start, end } = getWeekBounds(new Date());
  const m = computeMetrics(deals as Deal[], start, end);

  const netPositive = m.netHopperChange >= 0;

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
        <Link href="/deals/new">
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            Add Deal
          </Button>
        </Link>
      </div>

      {/* Pipeline snapshot */}
      <div>
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Pipeline</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <KpiCard
            title="Current LOI Pipeline"
            value={formatCurrency(m.loiPipeline)}
            accent="blue"
          />
          <KpiCard
            title="Current Hopper"
            value={formatCurrency(m.currentHopper)}
            accent="amber"
          />
          <KpiCard
            title="Expected Closings (Next 90 Days)"
            value={formatCurrency(m.next90Days)}
            accent="green"
          />
        </div>
      </div>

      {/* This week */}
      <div>
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">This Week</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <KpiCard
            title="LOI Added"
            value={formatCurrency(m.loiAddedAmount)}
            sub={`${m.loiAddedCount} deal${m.loiAddedCount !== 1 ? "s" : ""}`}
            accent="blue"
          />
          <KpiCard
            title="Hopper Gain"
            value={formatCurrency(m.hopperGainAmount)}
            sub={`${m.hopperGainCount} deal${m.hopperGainCount !== 1 ? "s" : ""}`}
            accent="amber"
          />
          <KpiCard
            title="Closed"
            value={formatCurrency(m.closedAmount)}
            sub={`${m.closedCount} deal${m.closedCount !== 1 ? "s" : ""}`}
            accent="green"
          />
          <KpiCard
            title="Lost"
            value={formatCurrency(m.loiLostAmount + m.hopperLostAmount)}
            sub={`${m.loiLostCount + m.hopperLostCount} deal${(m.loiLostCount + m.hopperLostCount) !== 1 ? "s" : ""}`}
            accent="red"
          />
          <KpiCard
            title="Net Hopper Change"
            value={`${netPositive ? "+" : ""}${formatCurrency(m.netHopperChange)}`}
            accent={netPositive ? "green" : "red"}
          />
        </div>
      </div>

      {/* Advisor table */}
      <AdvisorSummaryTable
        deals={deals as (Deal & { advisor: Advisor })[]}
        advisors={advisors}
      />
    </div>
  );
}
