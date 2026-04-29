import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { advisors, deals } from "../lib/db/schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema: { advisors, deals } });

async function seed() {
  console.log("Seeding database...");

  // Clear existing data
  await db.delete(deals);
  await db.delete(advisors);

  // Insert advisors
  const inserted = await db
    .insert(advisors)
    .values([
      { firstName: "Alec", lastName: "Marks", email: "alec@tri-oak.com" },
      { firstName: "Rutland", lastName: "Patterson", email: "rutland@tri-oak.com" },
      { firstName: "Sam", lastName: "Roe", email: "sam@tri-oak.com" },
      { firstName: "Phil", lastName: "Hontzas", email: "phil@tri-oak.com" },
      { firstName: "Shane", lastName: "Karnes", email: "shane@tri-oak.com" },
      { firstName: "Josh", lastName: "Tharp", email: "josh@tri-oak.com" },
    ])
    .returning();

  const byName = (first: string, last: string) => {
    const a = inserted.find((a) => a.firstName === first && a.lastName === last);
    if (!a) throw new Error(`Advisor not found: ${first} ${last}`);
    return a.id;
  };

  const alec = byName("Alec", "Marks");
  const rutland = byName("Rutland", "Patterson");
  const sam = byName("Sam", "Roe");
  const phil = byName("Phil", "Hontzas");
  const shane = byName("Shane", "Karnes");

  // LOI Stage (active)
  const loiDeals = [
    {
      dealName: "McDs - Augusta, GA",
      advisorId: alec,
      side: "buyer" as const,
      loiDate: "2026-04-10",
      loiExpectedCommission: "20250.00",
    },
    {
      dealName: "McDs - Harlan, KY",
      advisorId: rutland,
      side: "buyer" as const,
      loiDate: "2026-04-03",
      loiExpectedCommission: "27270.00",
    },
    {
      dealName: "DG - Eddyville, IA",
      advisorId: sam,
      side: "buyer_seller" as const,
      loiDate: "2026-01-22",
      loiExpectedCommission: "36720.00",
    },
  ];

  // Under Contract (active)
  const ucDeals = [
    {
      dealName: "DG - Lincolnton, GA",
      advisorId: phil,
      side: "seller" as const,
      loiDate: "2026-01-29",
      loiExpectedCommission: "18400.00",
      underContractDate: "2026-02-08",
      hopperGainAmount: "18400.00",
      expectedCloseDate: "2026-04-18",
    },
    {
      dealName: "DG - Troy, OH",
      advisorId: alec,
      side: "buyer" as const,
      loiDate: "2026-01-24",
      loiExpectedCommission: "25800.00",
      underContractDate: "2026-02-08",
      hopperGainAmount: "25800.00",
      expectedCloseDate: "2026-04-16",
    },
    {
      dealName: "DG - Gulfport, MS",
      advisorId: alec,
      side: "seller" as const,
      loiDate: "2026-02-18",
      loiExpectedCommission: "60600.00",
      underContractDate: "2026-03-05",
      hopperGainAmount: "60600.00",
      expectedCloseDate: "2026-05-07",
    },
    {
      dealName: "FD - Macon, GA",
      advisorId: shane,
      side: "seller" as const,
      loiDate: "2026-02-23",
      loiExpectedCommission: "57000.00",
      underContractDate: "2026-03-08",
      hopperGainAmount: "57000.00",
      expectedCloseDate: "2026-05-21",
    },
    {
      dealName: "DG - Anderson, SC",
      advisorId: alec,
      side: "buyer" as const,
      loiDate: "2026-03-17",
      loiExpectedCommission: "107160.00",
      underContractDate: "2026-03-22",
      hopperGainAmount: "107160.00",
      expectedCloseDate: "2026-05-22",
    },
    {
      dealName: "DG - Camden, TN",
      advisorId: alec,
      side: "buyer" as const,
      loiDate: "2026-03-21",
      loiExpectedCommission: "24000.00",
      underContractDate: "2026-03-23",
      hopperGainAmount: "24000.00",
      expectedCloseDate: "2026-05-23",
    },
    {
      dealName: "Northern Tool - Bossier City",
      advisorId: rutland,
      side: "buyer" as const,
      loiDate: "2026-03-08",
      loiExpectedCommission: "42460.00",
      underContractDate: "2026-03-24",
      hopperGainAmount: "42460.00",
      expectedCloseDate: "2026-06-02",
    },
    {
      dealName: "S&S - Jackson, TN",
      advisorId: rutland,
      side: "seller" as const,
      loiDate: "2025-12-07",
      loiExpectedCommission: "184000.00",
      underContractDate: "2026-01-24",
      hopperGainAmount: "184000.00",
      expectedCloseDate: "2026-04-14",
    },
  ];

  // Closed (2026 YTD)
  const closedDeals = [
    {
      dealName: "DG - Goodland, IN",
      advisorId: sam,
      side: "seller" as const,
      loiDate: "2026-01-24",
      loiExpectedCommission: "35584.00",
      underContractDate: "2026-02-01",
      hopperGainAmount: "35584.00",
      expectedCloseDate: "2026-02-25",
      closedDate: "2026-02-25",
      closedCommission: "35584.00",
      notes: "Co-advisor: SR",
    },
    {
      dealName: "DG - Henry, TN",
      advisorId: rutland,
      side: "buyer" as const,
      loiDate: "2025-09-15",
      loiExpectedCommission: "42088.00",
      underContractDate: "2025-11-04",
      hopperGainAmount: "42088.00",
      expectedCloseDate: "2026-03-08",
      closedDate: "2026-03-08",
      closedCommission: "42088.00",
    },
    {
      dealName: "DG - Milliken, CO",
      advisorId: alec,
      side: "buyer" as const,
      loiDate: "2026-01-23",
      loiExpectedCommission: "18800.00",
      underContractDate: "2026-01-25",
      hopperGainAmount: "18800.00",
      expectedCloseDate: "2026-03-20",
      closedDate: "2026-03-20",
      closedCommission: "18800.00",
    },
    {
      dealName: "DG - 9-Pack",
      advisorId: sam,
      side: "buyer_seller" as const,
      loiDate: "2025-09-15",
      loiExpectedCommission: "199466.00",
      underContractDate: "2025-11-13",
      hopperGainAmount: "199466.00",
      expectedCloseDate: "2026-03-10",
      closedDate: "2026-03-10",
      closedCommission: "199466.00",
    },
    {
      dealName: "DG - Hopkinsville, KY",
      advisorId: rutland,
      side: "buyer" as const,
      loiDate: "2025-12-02",
      loiExpectedCommission: "34299.00",
      underContractDate: "2025-12-27",
      hopperGainAmount: "34299.00",
      expectedCloseDate: "2026-04-02",
      closedDate: "2026-04-02",
      closedCommission: "34299.00",
    },
    {
      dealName: "DG - Goodland, IN (buyer)",
      advisorId: sam,
      side: "buyer" as const,
      loiDate: "2026-01-24",
      loiExpectedCommission: "34584.00",
      underContractDate: "2026-02-01",
      hopperGainAmount: "34584.00",
      expectedCloseDate: "2026-02-25",
      closedDate: "2026-02-25",
      closedCommission: "34584.00",
    },
    {
      dealName: "DG - Jeannette, PA",
      advisorId: sam,
      side: "buyer" as const,
      loiDate: "2025-07-22",
      loiExpectedCommission: "43086.00",
      underContractDate: "2025-09-15",
      hopperGainAmount: "43086.00",
      expectedCloseDate: "2026-03-22",
      closedDate: "2026-03-22",
      closedCommission: "43086.00",
    },
    {
      dealName: "WAGS - Fayetteville, NC",
      advisorId: sam,
      side: "buyer" as const,
      loiDate: "2025-11-06",
      loiExpectedCommission: "68026.00",
      underContractDate: "2025-12-05",
      hopperGainAmount: "68026.00",
      expectedCloseDate: "2026-03-18",
      closedDate: "2026-03-18",
      closedCommission: "68026.00",
    },
    {
      dealName: "DG - Denmark, TN",
      advisorId: rutland,
      side: "buyer" as const,
      loiDate: "2025-12-27",
      loiExpectedCommission: "51740.00",
      underContractDate: "2026-01-11",
      hopperGainAmount: "51740.00",
      expectedCloseDate: "2026-03-16",
      closedDate: "2026-03-16",
      closedCommission: "51740.00",
    },
    {
      dealName: "DG - Cohocton, NY",
      advisorId: alec,
      side: "buyer" as const,
      loiDate: "2025-09-16",
      loiExpectedCommission: "29550.00",
      underContractDate: "2025-10-01",
      hopperGainAmount: "29550.00",
      expectedCloseDate: "2026-01-24",
      closedDate: "2026-01-24",
      closedCommission: "29550.00",
    },
    {
      dealName: "WD - Baton Rouge, LA",
      advisorId: rutland,
      side: "buyer" as const,
      loiDate: "2025-09-04",
      loiExpectedCommission: "103125.00",
      underContractDate: "2025-09-25",
      hopperGainAmount: "103125.00",
      expectedCloseDate: "2026-01-23",
      closedDate: "2026-01-23",
      closedCommission: "103125.00",
    },
    {
      dealName: "DG - Louisville, KY",
      advisorId: rutland,
      side: "buyer" as const,
      loiDate: "2025-11-19",
      loiExpectedCommission: "31100.00",
      underContractDate: "2025-12-02",
      hopperGainAmount: "31100.00",
      expectedCloseDate: "2026-01-16",
      closedDate: "2026-01-16",
      closedCommission: "31100.00",
    },
    {
      dealName: "DG - Grenada, MS",
      advisorId: sam,
      side: "buyer" as const,
      loiDate: "2025-11-14",
      loiExpectedCommission: "19125.00",
      underContractDate: "2025-11-25",
      hopperGainAmount: "19125.00",
      expectedCloseDate: "2026-01-03",
      closedDate: "2026-01-03",
      closedCommission: "19125.00",
    },
    {
      dealName: "AZ - Camden, NJ",
      advisorId: rutland,
      side: "buyer" as const,
      loiDate: "2025-12-01",
      loiExpectedCommission: "27752.00",
      underContractDate: "2025-12-05",
      hopperGainAmount: "27752.00",
      expectedCloseDate: "2026-01-23",
      closedDate: "2026-01-23",
      closedCommission: "27752.00",
    },
    {
      dealName: "Mercy - Rogers, AR",
      advisorId: sam,
      side: "buyer" as const,
      loiDate: "2025-09-25",
      loiExpectedCommission: "78000.00",
      underContractDate: "2025-09-28",
      hopperGainAmount: "78000.00",
      expectedCloseDate: "2026-01-13",
      closedDate: "2026-01-13",
      closedCommission: "78000.00",
    },
  ];

  // Lost deals
  const lostDeals = [
    {
      dealName: "Valv - Gibsonia, PA",
      advisorId: alec,
      side: "buyer" as const,
      loiDate: "2026-01-15",
      loiExpectedCommission: "24348.00",
      lostDate: "2026-01-25",
      lostStage: "loi" as const,
      lostAmount: "24348.00",
    },
    {
      dealName: "Take 5 - Niles, OH",
      advisorId: alec,
      side: "buyer" as const,
      loiDate: "2025-12-28",
      loiExpectedCommission: "26100.00",
      lostDate: "2026-01-07",
      lostStage: "loi" as const,
      lostAmount: "26100.00",
    },
    {
      dealName: "McDs - Saraland, AL",
      advisorId: rutland,
      side: "buyer" as const,
      loiDate: "2026-03-08",
      loiExpectedCommission: "35788.00",
      lostDate: "2026-03-17",
      lostStage: "loi" as const,
      lostAmount: "35788.00",
    },
    {
      dealName: "Starbs - Peoria, AZ",
      advisorId: shane,
      side: "buyer" as const,
      loiDate: "2026-02-15",
      loiExpectedCommission: "49474.00",
      lostDate: "2026-03-01",
      lostStage: "loi" as const,
      lostAmount: "49474.00",
    },
    {
      dealName: "7-11 - Oklahoma City, OK",
      advisorId: shane,
      side: "buyer" as const,
      loiDate: "2026-02-05",
      loiExpectedCommission: "19500.00",
      lostDate: "2026-02-19",
      lostStage: "loi" as const,
      lostAmount: "19500.00",
    },
    {
      dealName: "7-11 - OKC (UC)",
      advisorId: rutland,
      side: "buyer" as const,
      loiDate: "2025-09-24",
      loiExpectedCommission: "26750.00",
      underContractDate: "2025-10-15",
      hopperGainAmount: "26750.00",
      expectedCloseDate: "2026-01-16",
      lostDate: "2026-01-16",
      lostStage: "under_contract" as const,
      lostAmount: "29250.00",
    },
    {
      dealName: "DG - Bryan, OH",
      advisorId: sam,
      side: "buyer" as const,
      loiDate: "2025-10-02",
      loiExpectedCommission: "28736.00",
      underContractDate: "2025-11-01",
      hopperGainAmount: "28736.00",
      expectedCloseDate: "2026-01-14",
      lostDate: "2026-01-14",
      lostStage: "under_contract" as const,
      lostAmount: "28736.00",
    },
    {
      dealName: "DG - Goodland, IN (lost)",
      advisorId: sam,
      side: "buyer" as const,
      loiDate: "2025-10-30",
      loiExpectedCommission: "32550.00",
      underContractDate: "2025-11-15",
      hopperGainAmount: "32550.00",
      expectedCloseDate: "2026-01-07",
      lostDate: "2026-01-07",
      lostStage: "under_contract" as const,
      lostAmount: "32550.00",
    },
    {
      dealName: "DG - East Palestine, OH",
      advisorId: sam,
      side: "buyer" as const,
      loiDate: "2025-10-02",
      loiExpectedCommission: "27092.00",
      underContractDate: "2025-11-01",
      hopperGainAmount: "27092.00",
      expectedCloseDate: "2026-02-08",
      lostDate: "2026-02-08",
      lostStage: "under_contract" as const,
      lostAmount: "27092.00",
    },
    {
      dealName: "PNC Bank - Missouri City, TX",
      advisorId: rutland,
      side: "buyer" as const,
      loiDate: "2026-01-15",
      loiExpectedCommission: "49200.00",
      underContractDate: "2026-02-01",
      hopperGainAmount: "49200.00",
      expectedCloseDate: "2026-03-22",
      lostDate: "2026-03-22",
      lostStage: "under_contract" as const,
      lostAmount: "49200.00",
    },
  ];

  await db.insert(deals).values([...loiDeals, ...ucDeals, ...closedDeals, ...lostDeals]);

  console.log(`✓ Seeded ${inserted.length} advisors`);
  console.log(`✓ Seeded ${loiDeals.length + ucDeals.length + closedDeals.length + lostDeals.length} deals`);
  console.log("Done.");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
