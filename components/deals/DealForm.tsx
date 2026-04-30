"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Advisor, Deal } from "@/lib/db/schema";
import type { DealFormData } from "@/actions/deals";
import { createDeal, updateDeal } from "@/actions/deals";

interface DealFormProps {
  advisors: Advisor[];
  deal?: Deal;
}

function Field({
  label,
  required,
  children,
  hint,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      {children}
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-white p-5 space-y-4" style={{ borderColor: "#E0DDD6" }}>
      <h3 className="font-semibold text-sm" style={{ color: "#1B3A2D" }}>{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

export function DealForm({ advisors, deal }: DealFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<DealFormData>({
    dealName: deal?.dealName ?? "",
    advisorId: deal?.advisorId ?? "",
    clientOrProperty: deal?.clientOrProperty ?? "",
    side: deal?.side ?? "buyer",
    loiDate: deal?.loiDate ?? "",
    loiExpectedCommission: deal?.loiExpectedCommission ?? "",
    underContractDate: deal?.underContractDate ?? "",
    hopperGainAmount: deal?.hopperGainAmount ?? "",
    expectedCloseDate: deal?.expectedCloseDate ?? "",
    closedDate: deal?.closedDate ?? "",
    closedCommission: deal?.closedCommission ?? "",
    lostDate: deal?.lostDate ?? "",
    lostStage: deal?.lostStage ?? undefined,
    lostAmount: deal?.lostAmount ?? "",
    notes: deal?.notes ?? "",
  });

  function set(field: keyof DealFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = deal
        ? await updateDeal(deal.id, form)
        : await createDeal(form);
      if (result.error) {
        setError(result.error);
      } else {
        router.push("/deals");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <Section title="Basic Info">
        <Field label="Deal Name" required>
          <Input
            value={form.dealName}
            onChange={(e) => set("dealName", e.target.value)}
            placeholder="e.g. DG - Springdale, AR"
            required
          />
        </Field>
        <Field label="Advisor" required>
          <Select value={form.advisorId} onValueChange={(v) => set("advisorId", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select advisor" />
            </SelectTrigger>
            <SelectContent>
              {advisors.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.firstName} {a.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Client / Property">
          <Input
            value={form.clientOrProperty}
            onChange={(e) => set("clientOrProperty", e.target.value)}
            placeholder="Client name or property address"
          />
        </Field>
        <Field label="Side" required>
          <Select value={form.side} onValueChange={(v) => set("side", v as DealFormData["side"])}>
            <SelectTrigger>
              <SelectValue placeholder="Select side" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="buyer">Buyer</SelectItem>
              <SelectItem value="seller">Seller</SelectItem>
              <SelectItem value="buyer_seller">Buyer + Seller</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </Section>

      <Section title="LOI">
        <Field label="LOI Date" hint="Date both parties executed the LOI (or draft PSA sent)">
          <Input
            type="date"
            value={form.loiDate}
            onChange={(e) => set("loiDate", e.target.value)}
          />
        </Field>
        <Field
          label="LOI Expected Commission"
          required={!!form.loiDate}
          hint="Expected commission at time of LOI"
        >
          <Input
            type="number"
            min="0"
            step="0.01"
            value={form.loiExpectedCommission}
            onChange={(e) => set("loiExpectedCommission", e.target.value)}
            placeholder="0.00"
          />
        </Field>
      </Section>

      <Section title="Under Contract">
        <Field label="Under Contract Date" hint="Date of fully executed PSA">
          <Input
            type="date"
            value={form.underContractDate}
            onChange={(e) => set("underContractDate", e.target.value)}
          />
        </Field>
        <Field
          label="Hopper Gain Amount"
          required={!!form.underContractDate}
          hint="Updated expected commission at time of UC"
        >
          <Input
            type="number"
            min="0"
            step="0.01"
            value={form.hopperGainAmount}
            onChange={(e) => set("hopperGainAmount", e.target.value)}
            placeholder="0.00"
          />
        </Field>
        <Field
          label="Expected Close Date"
          required={!!form.underContractDate}
          hint="Used for 90-day forecast"
        >
          <Input
            type="date"
            value={form.expectedCloseDate}
            onChange={(e) => set("expectedCloseDate", e.target.value)}
          />
        </Field>
      </Section>

      <Section title="Outcome">
        <Field label="Closed Date">
          <Input
            type="date"
            value={form.closedDate}
            onChange={(e) => set("closedDate", e.target.value)}
          />
        </Field>
        <Field label="Closed Commission" required={!!form.closedDate} hint="Actual earned commission">
          <Input
            type="number"
            min="0"
            step="0.01"
            value={form.closedCommission}
            onChange={(e) => set("closedCommission", e.target.value)}
            placeholder="0.00"
          />
        </Field>
        <Field label="Lost Date">
          <Input
            type="date"
            value={form.lostDate}
            onChange={(e) => set("lostDate", e.target.value)}
          />
        </Field>
        <Field label="Lost Stage" required={!!form.lostDate}>
          <Select
            value={form.lostStage ?? ""}
            onValueChange={(v) => set("lostStage", v as "loi" | "under_contract")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="loi">LOI</SelectItem>
              <SelectItem value="under_contract">Under Contract</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Lost Amount" required={!!form.lostDate}>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={form.lostAmount}
            onChange={(e) => set("lostAmount", e.target.value)}
            placeholder="0.00"
          />
        </Field>
      </Section>

      <div className="rounded-lg border bg-white p-5 space-y-3" style={{ borderColor: "#E0DDD6" }}>
        <h3 className="font-semibold text-sm" style={{ color: "#1B3A2D" }}>Notes</h3>
        <Textarea
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          placeholder="Co-advisor, deal context, etc."
          rows={3}
        />
      </div>

      <div className="flex gap-3 pb-8">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : deal ? "Save Changes" : "Add Deal"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/deals")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
