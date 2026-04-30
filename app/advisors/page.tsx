export const dynamic = "force-dynamic";
import { getDeals } from "@/actions/deals";
import { getAdvisors } from "@/actions/advisors";
import {
  getDealStatus,
  getWeekBounds,
  isInDateRange,
  isWithinDays,
  toNum,
} from "@/lib/deal-utils";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Deal, Advisor } from "@/lib/db/schema";

type DealWithAdvisor = Deal & { advisor: Advisor };

function AdvisorCard({
  advisor,
  deals,
  weekStart,
  weekEnd,
}: {
  advisor: Advisor;
  deals: DealWithAdvisor[];
  weekStart: Date;
  weekEnd: Date;
}) {
  const myDeals = deals.filter((d) => d.advisorId === advisor.id);

  let loiAddedAmt = 0;
  let loiToUcAmt = 0;
  let hopperGainAmt = 0;
  let hopperLostAmt = 0;
  let closedWeekAmt = 0;
  let loiPipeline = 0;
  let hopper = 0;
  let next90 = 0;
  let closedYtd = 0;

  const now = new Date();
  const thisYear = now.getFullYear();

  for (const d of myDeals) {
    const status = getDealStatus(d);

    if (isInDateRange(d.loiDate, weekStart, weekEnd)) {
      loiAddedAmt += toNum(d.loiExpectedCommission);
    }
    if (isInDateRange(d.underContractDate, weekStart, weekEnd)) {
      loiToUcAmt += toNum(d.hopperGainAmount);
      hopperGainAmt += toNum(d.hopperGainAmount);
    }
    if (status === "Lost" && isInDateRange(d.lostDate, weekStart, weekEnd) && d.lostStage === "under_contract") {
      hopperLostAmt += toNum(d.lostAmount);
    }
    if (status === "Closed" && isInDateRange(d.closedDate, weekStart, weekEnd)) {
      closedWeekAmt += toNum(d.closedCommission);
    }

    if (status === "LOI") loiPipeline += toNum(d.loiExpectedCommission);
    if (status === "Under Contract") {
      const amt = toNum(d.hopperGainAmount);
      hopper += amt;
      if (isWithinDays(d.expectedCloseDate, 90)) next90 += amt;
    }
    if (status === "Closed") {
      const cd = new Date(d.closedDate! + "T12:00:00");
      if (cd.getFullYear() === thisYear) closedYtd += toNum(d.closedCommission);
    }
  }

  const netHopperChange = hopperGainAmt - hopperLostAmt - closedWeekAmt;

  const brandMuted = "rgba(27,58,45,0.5)";
  const border = "#E0DDD6";

  return (
    <div id={advisor.id} className="rounded-lg border bg-white overflow-hidden" style={{ borderColor: border }}>
      <div className="px-5 py-3" style={{ backgroundColor: "#1B3A2D" }}>
        <h2 className="font-semibold text-white">
          {advisor.firstName} {advisor.lastName}
        </h2>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: brandMuted }}>This Week</p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {[
              { label: "LOI Added", value: loiAddedAmt, accent: "text-blue-700" },
              { label: "LOI → UC", value: loiToUcAmt, accent: "text-amber-700" },
              { label: "Hopper Gain", value: hopperGainAmt, accent: "text-amber-800" },
              { label: "Hopper Lost", value: hopperLostAmt, accent: "text-red-600" },
              { label: "Closed", value: closedWeekAmt, accent: "text-green-700" },
              {
                label: "Net Hopper",
                value: netHopperChange,
                accent: netHopperChange >= 0 ? "text-green-700" : "text-red-600",
                prefix: netHopperChange >= 0 ? "+" : "",
              },
            ].map(({ label, value, accent, prefix }) => (
              <div key={label} className="text-center">
                <p className="text-xs mb-0.5" style={{ color: brandMuted }}>{label}</p>
                <p className={`text-sm font-bold ${accent}`}>
                  {prefix}{formatCurrency(value)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t pt-4" style={{ borderColor: border }}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: brandMuted }}>Current</p>
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="text-left pb-1 font-semibold" style={{ color: brandMuted }}></th>
                <th className="text-right pb-1 font-semibold" style={{ color: brandMuted }}>Total</th>
                <th className="text-right pb-1 font-semibold" style={{ color: brandMuted }}>Co. (50%)</th>
                <th className="text-right pb-1 font-semibold" style={{ color: brandMuted }}>Broker (50%)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t" style={{ borderColor: border }}>
                <td className="py-1 pr-2 font-semibold text-blue-700">LOI Pipeline</td>
                <td className="py-1 text-right tabular-nums text-blue-700 font-bold">{formatCurrency(loiPipeline)}</td>
                <td className="py-1 text-right tabular-nums" style={{ color: "#1B3A2D" }}>{formatCurrency(loiPipeline / 2)}</td>
                <td className="py-1 text-right tabular-nums" style={{ color: "#1B3A2D" }}>{formatCurrency(loiPipeline / 2)}</td>
              </tr>
              <tr className="border-t" style={{ borderColor: border }}>
                <td className="py-1 pr-2 font-semibold text-amber-700">Hopper</td>
                <td className="py-1 text-right tabular-nums text-amber-700 font-bold">{formatCurrency(hopper)}</td>
                <td className="py-1 text-right tabular-nums" style={{ color: "#1B3A2D" }}>{formatCurrency(hopper / 2)}</td>
                <td className="py-1 text-right tabular-nums" style={{ color: "#1B3A2D" }}>{formatCurrency(hopper / 2)}</td>
              </tr>
              <tr className="border-t" style={{ borderColor: border }}>
                <td className="py-1 pr-2 font-semibold text-green-700">Closed YTD</td>
                <td className="py-1 text-right tabular-nums text-green-700 font-bold">{formatCurrency(closedYtd)}</td>
                <td className="py-1 text-right tabular-nums" style={{ color: "#1B3A2D" }}>{formatCurrency(closedYtd / 2)}</td>
                <td className="py-1 text-right tabular-nums" style={{ color: "#1B3A2D" }}>{formatCurrency(closedYtd / 2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {(() => {
          const ucDeals = myDeals.filter((d) => getDealStatus(d) === "Under Contract");
          if (ucDeals.length === 0) return null;
          return (
            <div className="border-t pt-4" style={{ borderColor: border }}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: brandMuted }}>Active UC Deals — 50/50 Split</p>
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    <th className="text-left pb-1 font-semibold" style={{ color: brandMuted }}>Deal</th>
                    <th className="text-right pb-1 font-semibold" style={{ color: brandMuted }}>Full Commission</th>
                    <th className="text-right pb-1 font-semibold" style={{ color: brandMuted }}>Broker (50%)</th>
                    <th className="text-right pb-1 font-semibold" style={{ color: brandMuted }}>Company (50%)</th>
                  </tr>
                </thead>
                <tbody>
                  {ucDeals.map((d) => {
                    const full = toNum(d.hopperGainAmount);
                    const half = full / 2;
                    return (
                      <tr key={d.id} className="border-t" style={{ borderColor: border }}>
                        <td className="py-1 pr-2 font-medium" style={{ color: "#1B3A2D" }}>{d.dealName}</td>
                        <td className="py-1 text-right tabular-nums text-amber-700">{formatCurrency(full)}</td>
                        <td className="py-1 text-right tabular-nums" style={{ color: "#1B3A2D" }}>{formatCurrency(half)}</td>
                        <td className="py-1 text-right tabular-nums" style={{ color: "#1B3A2D" }}>{formatCurrency(half)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })()}

        <div className="border-t pt-3" style={{ borderColor: border }}>
          <p className="text-xs mb-1" style={{ color: brandMuted }}>Next 90 Days</p>
          <p className="font-bold text-green-700">{formatCurrency(next90)}</p>
        </div>
      </div>
    </div>
  );
}

export default async function AdvisorsPage() {
  const [deals, advisors] = await Promise.all([getDeals(), getAdvisors()]);
  const { start, end } = getWeekBounds(new Date());
  const activeAdvisors = advisors.filter((a) => a.active);

  const now = new Date();
  const thisYear = now.getFullYear();

  // Leaderboard: sort by closed YTD
  const leaderboard = activeAdvisors
    .map((advisor) => {
      const myDeals = (deals as DealWithAdvisor[]).filter((d) => d.advisorId === advisor.id);
      const closedYtd = myDeals
        .filter((d) => {
          const s = getDealStatus(d);
          if (s !== "Closed") return false;
          const cd = new Date(d.closedDate! + "T12:00:00");
          return cd.getFullYear() === thisYear;
        })
        .reduce((sum, d) => sum + toNum(d.closedCommission), 0);
      const hopper = myDeals
        .filter((d) => getDealStatus(d) === "Under Contract")
        .reduce((sum, d) => sum + toNum(d.hopperGainAmount), 0);
      const loiPipeline = myDeals
        .filter((d) => getDealStatus(d) === "LOI")
        .reduce((sum, d) => sum + toNum(d.loiExpectedCommission), 0);
      return { advisor, closedYtd, hopper, loiPipeline };
    })
    .sort((a, b) => b.closedYtd - a.closedYtd);

  const brand = "#1B3A2D";
  const brandMuted = "rgba(27,58,45,0.5)";
  const border = "#E0DDD6";
  const bg = "#F5F2EC";

  return (
    <div className="px-4 py-6 space-y-6">
      <h1 className="text-xl font-bold" style={{ color: brand }}>Advisor Scorecards</h1>

      {/* Leaderboard */}
      <div className="rounded-lg border bg-white overflow-hidden" style={{ borderColor: border }}>
        <div className="px-5 py-3 border-b" style={{ borderColor: border }}>
          <h2 className="font-semibold text-sm" style={{ color: brand }}>Leaderboard — Closed YTD</h2>
        </div>
        <div className="overflow-x-auto">
        <table className="w-full text-sm whitespace-nowrap">
          <thead>
            <tr className="border-b" style={{ borderColor: border, backgroundColor: bg }}>
              <th className="px-4 py-2.5 text-left text-xs font-semibold" style={{ color: brandMuted }}>Advisor</th>
              <th className="px-3 py-2.5 text-right text-xs font-semibold text-blue-600">LOI Pipeline</th>
              <th className="px-3 py-2.5 text-right text-xs font-semibold text-blue-400">Co.</th>
              <th className="px-3 py-2.5 text-right text-xs font-semibold text-blue-400">Broker</th>
              <th className="px-3 py-2.5 text-right text-xs font-semibold text-amber-700">Hopper</th>
              <th className="px-3 py-2.5 text-right text-xs font-semibold text-amber-400">Co.</th>
              <th className="px-3 py-2.5 text-right text-xs font-semibold text-amber-400">Broker</th>
              <th className="px-3 py-2.5 text-right text-xs font-semibold text-green-700">Closed YTD</th>
              <th className="px-3 py-2.5 text-right text-xs font-semibold text-green-500">Co.</th>
              <th className="px-3 py-2.5 text-right text-xs font-semibold text-green-500">Broker</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map(({ advisor, closedYtd, hopper, loiPipeline }) => (
              <tr key={advisor.id} className="border-b last:border-0" style={{ borderColor: border }}>
                <td className="px-4 py-2.5 font-medium" style={{ color: brand }}>
                  {advisor.firstName} {advisor.lastName}
                </td>
                <td className="px-3 py-2.5 text-right text-blue-700 tabular-nums font-semibold">
                  {formatCurrency(loiPipeline)}
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums" style={{ color: "rgba(27,58,45,0.6)" }}>
                  {formatCurrency(loiPipeline / 2)}
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums" style={{ color: "rgba(27,58,45,0.6)" }}>
                  {formatCurrency(loiPipeline / 2)}
                </td>
                <td className="px-3 py-2.5 text-right text-amber-700 tabular-nums font-semibold">
                  {formatCurrency(hopper)}
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums" style={{ color: "rgba(27,58,45,0.6)" }}>
                  {formatCurrency(hopper / 2)}
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums" style={{ color: "rgba(27,58,45,0.6)" }}>
                  {formatCurrency(hopper / 2)}
                </td>
                <td className="px-3 py-2.5 text-right text-green-700 tabular-nums font-semibold">
                  {formatCurrency(closedYtd)}
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums" style={{ color: "rgba(27,58,45,0.6)" }}>
                  {formatCurrency(closedYtd / 2)}
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums" style={{ color: "rgba(27,58,45,0.6)" }}>
                  {formatCurrency(closedYtd / 2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {/* Advisor cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {activeAdvisors.map((advisor) => (
          <AdvisorCard
            key={advisor.id}
            advisor={advisor}
            deals={deals as DealWithAdvisor[]}
            weekStart={start}
            weekEnd={end}
          />
        ))}
      </div>
    </div>
  );
}
