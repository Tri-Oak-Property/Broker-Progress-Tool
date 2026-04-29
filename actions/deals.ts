"use server";
import { db } from "@/lib/db";
import { deals } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type DealFormData = {
  dealName: string;
  advisorId: string;
  clientOrProperty?: string;
  side: "buyer" | "seller" | "buyer_seller";
  loiDate?: string;
  loiExpectedCommission?: string;
  underContractDate?: string;
  hopperGainAmount?: string;
  expectedCloseDate?: string;
  closedDate?: string;
  closedCommission?: string;
  lostDate?: string;
  lostStage?: "loi" | "under_contract";
  lostAmount?: string;
  notes?: string;
};

function validateDeal(data: DealFormData): string | null {
  if (!data.dealName?.trim()) return "Deal name is required.";
  if (!data.advisorId) return "Advisor is required.";
  if (!data.side) return "Side is required.";
  if (data.loiDate && !data.loiExpectedCommission) return "LOI Expected Commission is required when LOI Date is set.";
  if (data.underContractDate && !data.hopperGainAmount) return "Hopper Gain Amount is required when Under Contract Date is set.";
  if (data.underContractDate && !data.expectedCloseDate) return "Expected Close Date is required when Under Contract Date is set.";
  if (data.lostDate && !data.lostStage) return "Lost Stage is required when Lost Date is set.";
  if (data.lostDate && !data.lostAmount) return "Lost Amount is required when Lost Date is set.";
  if (data.closedDate && !data.closedCommission) return "Closed Commission is required when Closed Date is set.";
  if (data.closedDate && data.lostDate) return "A deal cannot be both Closed and Lost.";
  if (data.underContractDate && data.loiDate && data.underContractDate < data.loiDate) {
    return "Under Contract Date must be on or after LOI Date.";
  }
  if (data.closedDate && data.underContractDate && data.closedDate < data.underContractDate) {
    return "Closed Date must be on or after Under Contract Date.";
  }
  return null;
}

function toNullable(val?: string): string | null {
  if (!val || val.trim() === "") return null;
  return val.trim();
}

export async function createDeal(data: DealFormData) {
  const err = validateDeal(data);
  if (err) return { error: err };

  await db.insert(deals).values({
    dealName: data.dealName.trim(),
    advisorId: data.advisorId,
    clientOrProperty: toNullable(data.clientOrProperty),
    side: data.side,
    loiDate: toNullable(data.loiDate),
    loiExpectedCommission: toNullable(data.loiExpectedCommission),
    underContractDate: toNullable(data.underContractDate),
    hopperGainAmount: toNullable(data.hopperGainAmount),
    expectedCloseDate: toNullable(data.expectedCloseDate),
    closedDate: toNullable(data.closedDate),
    closedCommission: toNullable(data.closedCommission),
    lostDate: toNullable(data.lostDate),
    lostStage: (data.lostStage || null) as "loi" | "under_contract" | null,
    lostAmount: toNullable(data.lostAmount),
    notes: toNullable(data.notes),
  });

  revalidatePath("/");
  revalidatePath("/deals");
  revalidatePath("/weekly");
  revalidatePath("/advisors");
  return { error: null };
}

export async function updateDeal(id: string, data: DealFormData) {
  const err = validateDeal(data);
  if (err) return { error: err };

  await db
    .update(deals)
    .set({
      dealName: data.dealName.trim(),
      advisorId: data.advisorId,
      clientOrProperty: toNullable(data.clientOrProperty),
      side: data.side,
      loiDate: toNullable(data.loiDate),
      loiExpectedCommission: toNullable(data.loiExpectedCommission),
      underContractDate: toNullable(data.underContractDate),
      hopperGainAmount: toNullable(data.hopperGainAmount),
      expectedCloseDate: toNullable(data.expectedCloseDate),
      closedDate: toNullable(data.closedDate),
      closedCommission: toNullable(data.closedCommission),
      lostDate: toNullable(data.lostDate),
      lostStage: (data.lostStage || null) as "loi" | "under_contract" | null,
      lostAmount: toNullable(data.lostAmount),
      notes: toNullable(data.notes),
      updatedAt: new Date(),
    })
    .where(eq(deals.id, id));

  revalidatePath("/");
  revalidatePath("/deals");
  revalidatePath(`/deals/${id}/edit`);
  revalidatePath("/weekly");
  revalidatePath("/advisors");
  return { error: null };
}

export async function getDeals() {
  return db.query.deals.findMany({
    with: { advisor: true },
    orderBy: (d, { desc }) => [desc(d.createdAt)],
  });
}

export async function getDeal(id: string) {
  return db.query.deals.findFirst({
    where: eq(deals.id, id),
    with: { advisor: true },
  });
}
