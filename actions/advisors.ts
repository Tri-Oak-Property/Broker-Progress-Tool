"use server";
import { db } from "@/lib/db";
import { advisors } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getAdvisors() {
  return db.query.advisors.findMany({
    orderBy: (a, { asc }) => [asc(a.lastName), asc(a.firstName)],
  });
}

export async function createAdvisor(data: {
  firstName: string;
  lastName: string;
  email?: string;
}) {
  await db.insert(advisors).values({
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    email: data.email?.trim() || null,
  });
  revalidatePath("/settings");
  revalidatePath("/deals");
  revalidatePath("/advisors");
}

export async function updateAdvisor(
  id: string,
  data: { firstName: string; lastName: string; email?: string; active: boolean }
) {
  await db
    .update(advisors)
    .set({
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email: data.email?.trim() || null,
      active: data.active,
      updatedAt: new Date(),
    })
    .where(eq(advisors.id, id));
  revalidatePath("/settings");
  revalidatePath("/deals");
  revalidatePath("/advisors");
}
