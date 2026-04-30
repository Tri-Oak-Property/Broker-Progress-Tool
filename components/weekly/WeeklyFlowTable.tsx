"use client";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getWeekBounds, isInDateRange, toNum, getDealStatus } from "@/lib/deal-utils";
import type { Deal } from "@/lib/db/schema";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface WeekRow {
  weekStart: Date;
  weekEnd: Date;
  loiAddedCount: number;
  loiAddedAmt: number;
  loiLostCount: number;
  loiLostAmt: number;
  loiToUcCount: number;
  loiToUcAmt: number;
  hopperGainCount: number;
  hopperGainAmt: number;
  hopperLostCount: number;
  hopperLostAmt: number;
  closedCount: number;
  closedAmt: number;
  endingLoiPipeline: number;
  endingHopper: number;
  netHopperChange: number;
}

function computeWeeks(deals: Deal[], anchorMonday: Date, numWeeks: number): WeekRow[] {
  const rows: WeekRow[] = [];

  for (let i = numWeeks - 1; i >= 0; i--) {
    const weekStart = new Date(anchorMonday);
    weekStart.setDate(anchorMonday.getDate() - i * 7);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    let loiAddedCount = 0, loiAddedAmt = 0;
    let loiLostCount = 0, loiLostAmt = 0;
    let loiToUcCount = 0, loiToUcAmt = 0;
    let hopperGainCount = 0, hopperGainAmt = 0;
    let hopperLostCount = 0, hopperLostAmt = 0;
    let closedCount = 0, closedAmt = 0;

    // Ending pipeline: as of week end
    let endingLoiPipeline = 0;
    let endingHopper = 0;

    for (const deal of deals) {
      const loiDateInRange = isInDateRange(deal.loiDate, weekStart, weekEnd);
      const ucDateInRange = isInDateRange(deal.underContractDate, weekStart, weekEnd);
      const closedInRange = isInDateRange(deal.closedDate, weekStart, weekEnd);
      const lostInRange = isInDateRange(deal.lostDate, weekStart, weekEnd);

      if (loiDateInRange) {
        loiAddedCount++;
        loiAddedAmt += toNum(deal.loiExpectedCommission);
      }
      if (ucDateInRange) {
        hopperGainCount++;
        hopperGainAmt += toNum(deal.hopperGainAmount);
        loiToUcCount++;
        loiToUcAmt += toNum(deal.hopperGainAmount);
      }
      if (closedInRange) {
        closedCount++;
        closedAmt += toNum(deal.closedCommission);
      }
      if (lostInRange) {
        const lostAmt = toNum(deal.lostAmount);
        if (deal.lostStage === "loi") {
          loiLostCount++;
          loiLostAmt += lostAmt;
        } else {
          hopperLostCount++;
          hopperLostAmt += lostAmt;
        }
      }

      // Ending LOI Pipeline: loi_date <= weekEnd, no uc_date, no lost_date, no closed_date
      // (or those dates are after weekEnd)
      const loiExists = deal.loiDate && new Date(deal.loiDate + "T12:00:00") <= weekEnd;
      const ucAfterWeek = !deal.underContractDate || new Date(deal.underContractDate + "T12:00:00") > weekEnd;
      const lostAfterWeek = !deal.lostDate || new Date(deal.lostDate + "T12:00:00") > weekEnd;
      const closedAfterWeek = !deal.closedDate || new Date(deal.closedDate + "T12:00:00") > weekEnd;

      if (loiExists && ucAfterWeek && lostAfterWeek && closedAfterWeek) {
        endingLoiPipeline += toNum(deal.loiExpectedCommission);
      }

      // Ending Hopper: uc_date <= weekEnd, no closed_date, no lost_date (or after weekEnd)
      const ucExists = deal.underContractDate && new Date(deal.underContractDate + "T12:00:00") <= weekEnd;
      if (ucExists && closedAfterWeek && lostAfterWeek) {
        endingHopper += toNum(deal.hopperGainAmount);
      }
    }

    const netHopperChange = hopperGainAmt - hopperLostAmt - closedAmt;

    rows.push({
      weekStart,
      weekEnd,
      loiAddedCount,
      loiAddedAmt,
      loiLostCount,
      loiLostAmt,
      loiToUcCount,
      loiToUcAmt,
      hopperGainCount,
      hopperGainAmt,
      hopperLostCount,
      hopperLostAmt,
      closedCount,
      closedAmt,
      endingLoiPipeline,
      endingHopper,
      netHopperChange,
    });
  }

  return rows;
}

function getThisMonday(): Date {
  const { start } = getWeekBounds(new Date());
  return start;
}

function fmt(n: number, count?: number): string {
  return count !== undefined && count > 0
    ? `${formatCurrency(n)} (${count})`
    : formatCurrency(n);
}

export function WeeklyFlowTable({ deals }: { deals: Deal[] }) {
  const [anchorMonday, setAnchorMonday] = useState<Date>(getThisMonday);
  const NUM_WEEKS = 8;

  const rows = useMemo(
    () => computeWeeks(deals, anchorMonday, NUM_WEEKS),
    [deals, anchorMonday]
  );

  function shiftWeek(delta: number) {
    setAnchorMonday((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + delta * 7);
      return d;
    });
  }

  const brand = "#1B3A2D";
  const brandMuted = "rgba(27,58,45,0.5)";
  const border = "#E0DDD6";
  const bg = "#F5F2EC";

  return (
    <div className="space-y-4">
      {/* Week navigation */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => shiftWeek(-1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium" style={{ color: brand }}>
          {NUM_WEEKS} weeks ending{" "}
          {formatDate(new Date(anchorMonday.getTime() + 6 * 86400000))}
        </span>
        <Button variant="outline" size="sm" onClick={() => shiftWeek(1)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="text-xs" style={{ color: brandMuted }} onClick={() => setAnchorMonday(getThisMonday())}>
          This week
        </Button>
      </div>

      <div className="rounded-lg border bg-white overflow-hidden" style={{ borderColor: border }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b" style={{ borderColor: border, backgroundColor: bg }}>
                <th className="px-3 py-2.5 text-left text-xs font-semibold sticky left-0 min-w-[120px]" style={{ color: brandMuted, backgroundColor: bg }}>Week</th>
                <th className="px-3 py-2.5 text-right text-xs font-semibold text-blue-600">LOI Added</th>
                <th className="px-3 py-2.5 text-right text-xs font-semibold text-red-500">LOI Lost</th>
                <th className="px-3 py-2.5 text-right text-xs font-semibold text-amber-600">LOI → UC</th>
                <th className="px-3 py-2.5 text-right text-xs font-semibold text-amber-700">Hopper Gain</th>
                <th className="px-3 py-2.5 text-right text-xs font-semibold text-red-500">Hopper Lost</th>
                <th className="px-3 py-2.5 text-right text-xs font-semibold text-green-700">Closed</th>
                <th className="px-3 py-2.5 text-right text-xs font-semibold" style={{ color: brandMuted }}>Ending LOI</th>
                <th className="px-3 py-2.5 text-right text-xs font-semibold" style={{ color: brandMuted }}>Ending Hopper</th>
                <th className="px-3 py-2.5 text-right text-xs font-semibold" style={{ color: brandMuted }}>Net Hopper</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const isCurrentWeek =
                  row.weekStart.toDateString() === getThisMonday().toDateString();
                const rowBg = isCurrentWeek ? "rgba(27,58,45,0.05)" : "";
                return (
                  <tr
                    key={i}
                    className="border-b last:border-0"
                    style={{ borderColor: border, backgroundColor: rowBg }}
                  >
                    <td
                      className="px-3 py-2.5 font-medium sticky left-0"
                      style={{ color: brand, backgroundColor: isCurrentWeek ? "rgba(27,58,45,0.05)" : "white" }}
                    >
                      {formatDate(row.weekStart)}
                      {isCurrentWeek && (
                        <span className="ml-1.5 text-xs font-normal" style={{ color: "#2D5A3D" }}>Current</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-right text-blue-700 tabular-nums">
                      {row.loiAddedCount > 0 ? fmt(row.loiAddedAmt, row.loiAddedCount) : <span style={{ color: border }}>—</span>}
                    </td>
                    <td className="px-3 py-2.5 text-right text-red-600 tabular-nums">
                      {row.loiLostCount > 0 ? fmt(row.loiLostAmt, row.loiLostCount) : <span style={{ color: border }}>—</span>}
                    </td>
                    <td className="px-3 py-2.5 text-right text-amber-700 tabular-nums">
                      {row.loiToUcCount > 0 ? fmt(row.loiToUcAmt, row.loiToUcCount) : <span style={{ color: border }}>—</span>}
                    </td>
                    <td className="px-3 py-2.5 text-right text-amber-800 tabular-nums font-medium">
                      {row.hopperGainCount > 0 ? fmt(row.hopperGainAmt, row.hopperGainCount) : <span style={{ color: border }}>—</span>}
                    </td>
                    <td className="px-3 py-2.5 text-right text-red-600 tabular-nums">
                      {row.hopperLostCount > 0 ? fmt(row.hopperLostAmt, row.hopperLostCount) : <span style={{ color: border }}>—</span>}
                    </td>
                    <td className="px-3 py-2.5 text-right text-green-700 tabular-nums font-medium">
                      {row.closedCount > 0 ? fmt(row.closedAmt, row.closedCount) : <span style={{ color: border }}>—</span>}
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums" style={{ color: brand }}>
                      {formatCurrency(row.endingLoiPipeline)}
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums font-medium" style={{ color: brand }}>
                      {formatCurrency(row.endingHopper)}
                    </td>
                    <td className={`px-3 py-2.5 text-right tabular-nums font-medium ${row.netHopperChange >= 0 ? "text-green-700" : "text-red-600"}`}>
                      {row.netHopperChange >= 0 ? "+" : ""}{formatCurrency(row.netHopperChange)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs" style={{ color: brandMuted }}>
        LOI → UC and Hopper Gain both reflect the hopper_gain_amount for deals that went Under Contract that week.
        Ending LOI and Hopper balances are point-in-time snapshots as of end of each week.
      </p>
    </div>
  );
}
