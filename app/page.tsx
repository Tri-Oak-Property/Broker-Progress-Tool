export const dynamic = "force-dynamic";
import Link from "next/link";
import { getDeals } from "@/actions/deals";
import { getAdvisors } from "@/actions/advisors";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { AdvisorSummaryTable } from "@/components/dashboard/AdvisorSummaryTable";
import { Button } from "@/components/ui/button";
import { computeMetrics, getWeekBounds, getDealStatus, isWithinDays, toNum } from "@/lib/deal-utils";
import { formatCurrency } from "@/lib/utils";
import { Plus } from "lucide-react";
import type { Deal, Advisor } from "@/lib/db/schema";

export default async function DashboardPage() {
  const [deals, advisors] = await Promise.all([getDeals(), getAdvisors()]);
  const { start, end } = getWeekBounds(new Date());
  const m = computeMetrics(deals as Deal[], start, end);

  const netPositive = m.netHopperChange >= 0;

  const activeUC = (deals as Deal[]).filter((d) => getDealStatus(d) === "Under Contract");
  const next30 = activeUC.filter((d) => isWithinDays(d.expectedCloseDate, 30)).reduce((s, d) => s + toNum(d.hopperGainAmount), 0);
  const next60 = activeUC.filter((d) => isWithinDays(d.expectedCloseDate, 60)).reduce((s, d) => s + toNum(d.hopperGainAmount), 0);
  const next90 = activeUC.filter((d) => isWithinDays(d.expectedCloseDate, 90)).reduce((s, d) => s + toNum(d.hopperGainAmount), 0);
  const companyShare = m.currentHopper / 2;
  const brokerShare = m.currentHopper / 2;

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold" style={{ color: "#1B3A2D" }}>Dashboard</h1>
        <Link href="/deals/new">
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            Add Deal
          </Button>
        </Link>
      </div>

      {/* Pipeline snapshot */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "rgba(27,58,45,0.45)" }}>Pipeline</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
          <div className="rounded-lg border bg-white p-4 space-y-1" style={{ borderColor: "#E0DDD6" }}>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "rgba(27,58,45,0.45)" }}>Expected Closings</p>
            <div className="space-y-0.5 pt-1">
              <div className="flex justify-between text-sm">
                <span style={{ color: "rgba(27,58,45,0.6)" }}>30 days</span>
                <span className="font-semibold text-green-700 tabular-nums">{formatCurrency(next30)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: "rgba(27,58,45,0.6)" }}>60 days</span>
                <span className="font-semibold text-green-700 tabular-nums">{formatCurrency(next60)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: "rgba(27,58,45,0.6)" }}>90 days</span>
                <span className="font-semibold text-green-700 tabular-nums">{formatCurrency(next90)}</span>
              </div>
            </div>
          </div>
          <div className="rounded-lg border bg-white p-4 space-y-1" style={{ borderColor: "#E0DDD6" }}>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "rgba(27,58,45,0.45)" }}>Hopper Split (50/50)</p>
            <div className="space-y-0.5 pt-1">
              <div className="flex justify-between text-sm">
                <span style={{ color: "rgba(27,58,45,0.6)" }}>Company</span>
                <span className="font-semibold tabular-nums" style={{ color: "#1B3A2D" }}>{formatCurrency(companyShare)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: "rgba(27,58,45,0.6)" }}>Broker</span>
                <span className="font-semibold tabular-nums" style={{ color: "#1B3A2D" }}>{formatCurrency(brokerShare)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* This week */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "rgba(27,58,45,0.45)" }}>This Week</h2>
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
