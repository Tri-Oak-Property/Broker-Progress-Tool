import type { Deal } from "./db/schema";

export type DealStatus = "LOI" | "Under Contract" | "Closed" | "Lost" | "Draft";

export function getDealStatus(deal: Pick<Deal, "closedDate" | "lostDate" | "underContractDate" | "loiDate">): DealStatus {
  if (deal.closedDate) return "Closed";
  if (deal.lostDate) return "Lost";
  if (deal.underContractDate) return "Under Contract";
  if (deal.loiDate) return "LOI";
  return "Draft";
}

export function getWeekBounds(date: Date): { start: Date; end: Date } {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun, 1=Mon
  const diff = day === 0 ? -6 : 1 - day; // adjust to Monday
  const start = new Date(d);
  start.setDate(d.getDate() + diff);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

export function isInDateRange(dateStr: string | null | undefined, start: Date, end: Date): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr + "T12:00:00");
  return d >= start && d <= end;
}

export function isWithinDays(dateStr: string | null | undefined, days: number): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr + "T12:00:00");
  const now = new Date();
  const future = new Date();
  future.setDate(now.getDate() + days);
  now.setHours(0, 0, 0, 0);
  return d >= now && d <= future;
}

export function toNum(val: string | null | undefined): number {
  if (!val) return 0;
  return parseFloat(val) || 0;
}

export interface PipelineMetrics {
  loiPipeline: number;
  currentHopper: number;
  next90Days: number;
  loiAddedCount: number;
  loiAddedAmount: number;
  hopperGainCount: number;
  hopperGainAmount: number;
  closedCount: number;
  closedAmount: number;
  loiLostCount: number;
  loiLostAmount: number;
  hopperLostCount: number;
  hopperLostAmount: number;
  netHopperChange: number;
}

export function computeMetrics(deals: Deal[], weekStart: Date, weekEnd: Date): PipelineMetrics {
  let loiPipeline = 0;
  let currentHopper = 0;
  let next90Days = 0;
  let loiAddedCount = 0, loiAddedAmount = 0;
  let hopperGainCount = 0, hopperGainAmount = 0;
  let closedCount = 0, closedAmount = 0;
  let loiLostCount = 0, loiLostAmount = 0;
  let hopperLostCount = 0, hopperLostAmount = 0;

  for (const deal of deals) {
    const status = getDealStatus(deal);

    if (status === "LOI") {
      loiPipeline += toNum(deal.loiExpectedCommission);
    }

    if (status === "Under Contract") {
      const amt = toNum(deal.hopperGainAmount);
      currentHopper += amt;
      if (isWithinDays(deal.expectedCloseDate, 90)) {
        next90Days += amt;
      }
    }

    if (isInDateRange(deal.loiDate, weekStart, weekEnd) && status !== "Draft") {
      loiAddedCount++;
      loiAddedAmount += toNum(deal.loiExpectedCommission);
    }

    if (isInDateRange(deal.underContractDate, weekStart, weekEnd)) {
      hopperGainCount++;
      hopperGainAmount += toNum(deal.hopperGainAmount);
    }

    if (status === "Closed" && isInDateRange(deal.closedDate, weekStart, weekEnd)) {
      closedCount++;
      closedAmount += toNum(deal.closedCommission);
    }

    if (status === "Lost" && isInDateRange(deal.lostDate, weekStart, weekEnd)) {
      const lostAmt = toNum(deal.lostAmount);
      if (deal.lostStage === "loi") {
        loiLostCount++;
        loiLostAmount += lostAmt;
      } else {
        hopperLostCount++;
        hopperLostAmount += lostAmt;
      }
    }
  }

  const netHopperChange = hopperGainAmount - hopperLostAmount - closedAmount;

  return {
    loiPipeline,
    currentHopper,
    next90Days,
    loiAddedCount,
    loiAddedAmount,
    hopperGainCount,
    hopperGainAmount,
    closedCount,
    closedAmount,
    loiLostCount,
    loiLostAmount,
    hopperLostCount,
    hopperLostAmount,
    netHopperChange,
  };
}
