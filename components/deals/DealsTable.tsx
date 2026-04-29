"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "./StatusBadge";
import { getDealStatus } from "@/lib/deal-utils";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Deal, Advisor } from "@/lib/db/schema";
import type { DealStatus } from "@/lib/deal-utils";
import { Plus, Pencil } from "lucide-react";

type DealWithAdvisor = Deal & { advisor: Advisor };

const SIDE_LABELS: Record<string, string> = {
  buyer: "Buyer",
  seller: "Seller",
  buyer_seller: "Buyer + Seller",
};

export function DealsTable({
  deals,
  advisors,
}: {
  deals: DealWithAdvisor[];
  advisors: Advisor[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filterAdvisor, setFilterAdvisor] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSide, setFilterSide] = useState("all");

  const filtered = useMemo(() => {
    return deals.filter((d) => {
      const status = getDealStatus(d);
      const name = d.dealName.toLowerCase();
      const advisorName = `${d.advisor.firstName} ${d.advisor.lastName}`.toLowerCase();

      if (search && !name.includes(search.toLowerCase()) && !advisorName.includes(search.toLowerCase())) return false;
      if (filterAdvisor !== "all" && d.advisorId !== filterAdvisor) return false;
      if (filterStatus !== "all" && status !== filterStatus) return false;
      if (filterSide !== "all" && d.side !== filterSide) return false;
      return true;
    });
  }, [deals, search, filterAdvisor, filterStatus, filterSide]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          placeholder="Search deals or advisors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-xs"
        />
        <Select value={filterAdvisor} onValueChange={setFilterAdvisor}>
          <SelectTrigger className="sm:w-44">
            <SelectValue placeholder="All advisors" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Advisors</SelectItem>
            {advisors.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.firstName} {a.lastName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="sm:w-40">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="LOI">LOI</SelectItem>
            <SelectItem value="Under Contract">Under Contract</SelectItem>
            <SelectItem value="Closed">Closed</SelectItem>
            <SelectItem value="Lost">Lost</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterSide} onValueChange={setFilterSide}>
          <SelectTrigger className="sm:w-40">
            <SelectValue placeholder="All sides" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sides</SelectItem>
            <SelectItem value="buyer">Buyer</SelectItem>
            <SelectItem value="seller">Seller</SelectItem>
            <SelectItem value="buyer_seller">Buyer + Seller</SelectItem>
          </SelectContent>
        </Select>
        <div className="sm:ml-auto">
          <Link href="/deals/new">
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              Add Deal
            </Button>
          </Link>
        </div>
      </div>

      {/* Count */}
      <p className="text-sm text-slate-500">
        {filtered.length} deal{filtered.length !== 1 ? "s" : ""}
      </p>

      {/* Table — desktop */}
      <div className="hidden lg:block rounded-lg border border-slate-200 overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {["Deal Name", "Advisor", "Side", "Status", "LOI Date", "LOI Comm", "UC Date", "Hopper Amt", "Exp Close", "Closed Date", "Closed Comm", "Lost Date", "Lost Stage", ""].map((h) => (
                  <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={14} className="px-3 py-8 text-center text-sm text-slate-400">
                    No deals found.
                  </td>
                </tr>
              )}
              {filtered.map((deal) => {
                const status = getDealStatus(deal);
                return (
                  <tr
                    key={deal.id}
                    className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
                    onClick={() => router.push(`/deals/${deal.id}/edit`)}
                  >
                    <td className="px-3 py-2.5 font-medium text-slate-900 whitespace-nowrap max-w-[200px] truncate">
                      {deal.dealName}
                    </td>
                    <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap">
                      {deal.advisor.firstName} {deal.advisor.lastName}
                    </td>
                    <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap">
                      {SIDE_LABELS[deal.side]}
                    </td>
                    <td className="px-3 py-2.5">
                      <StatusBadge status={status} />
                    </td>
                    <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap">
                      {formatDate(deal.loiDate)}
                    </td>
                    <td className="px-3 py-2.5 text-slate-900 whitespace-nowrap tabular-nums">
                      {formatCurrency(deal.loiExpectedCommission)}
                    </td>
                    <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap">
                      {formatDate(deal.underContractDate)}
                    </td>
                    <td className="px-3 py-2.5 text-slate-900 whitespace-nowrap tabular-nums">
                      {formatCurrency(deal.hopperGainAmount)}
                    </td>
                    <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap">
                      {formatDate(deal.expectedCloseDate)}
                    </td>
                    <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap">
                      {formatDate(deal.closedDate)}
                    </td>
                    <td className="px-3 py-2.5 text-slate-900 whitespace-nowrap tabular-nums">
                      {formatCurrency(deal.closedCommission, true)}
                    </td>
                    <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap">
                      {formatDate(deal.lostDate)}
                    </td>
                    <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap capitalize">
                      {deal.lostStage ? deal.lostStage.replace("_", " ") : "—"}
                    </td>
                    <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                      <Link href={`/deals/${deal.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Card list — mobile/tablet */}
      <div className="lg:hidden space-y-2">
        {filtered.length === 0 && (
          <p className="text-center text-sm text-slate-400 py-8">No deals found.</p>
        )}
        {filtered.map((deal) => {
          const status = getDealStatus(deal);
          return (
            <Link key={deal.id} href={`/deals/${deal.id}/edit`} className="block">
              <div className="rounded-lg border border-slate-200 bg-white p-4 hover:border-slate-300 transition-colors">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="font-semibold text-slate-900 text-sm">{deal.dealName}</span>
                  <StatusBadge status={status} />
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span>{deal.advisor.firstName} {deal.advisor.lastName}</span>
                  <span>{SIDE_LABELS[deal.side]}</span>
                  {deal.loiDate && <span>LOI {formatDate(deal.loiDate)}</span>}
                  {deal.underContractDate && <span>UC {formatDate(deal.underContractDate)}</span>}
                  {deal.expectedCloseDate && <span>Exp Close {formatDate(deal.expectedCloseDate)}</span>}
                </div>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium text-slate-700">
                  {deal.hopperGainAmount && status === "Under Contract" && (
                    <span>Hopper: {formatCurrency(deal.hopperGainAmount)}</span>
                  )}
                  {deal.loiExpectedCommission && status === "LOI" && (
                    <span>LOI: {formatCurrency(deal.loiExpectedCommission)}</span>
                  )}
                  {deal.closedCommission && <span>Closed: {formatCurrency(deal.closedCommission, true)}</span>}
                  {deal.lostAmount && <span>Lost: {formatCurrency(deal.lostAmount)}</span>}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
