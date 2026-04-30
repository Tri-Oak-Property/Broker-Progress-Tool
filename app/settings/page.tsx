export const dynamic = "force-dynamic";
import { getAdvisors } from "@/actions/advisors";
import { AdvisorManager } from "@/components/advisors/AdvisorManager";

export default async function SettingsPage() {
  const advisors = await getAdvisors();
  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-xl font-bold" style={{ color: "#1B3A2D" }}>Settings</h1>
      <AdvisorManager advisors={advisors} />
      <div className="rounded-lg border bg-white p-5 space-y-3" style={{ borderColor: "#E0DDD6" }}>
        <h2 className="font-semibold" style={{ color: "#1B3A2D" }}>Database</h2>
        <p className="text-sm" style={{ color: "rgba(27,58,45,0.7)" }}>
          To seed the database with Tri-Oak&apos;s initial deal data, run:
        </p>
        <pre className="rounded-md px-3 py-2 text-xs font-mono overflow-x-auto" style={{ backgroundColor: "#F5F2EC", color: "#1B3A2D" }}>
          npm run db:seed
        </pre>
        <p className="text-xs" style={{ color: "rgba(27,58,45,0.4)" }}>
          Requires DATABASE_URL set in .env.local. Will clear existing data.
        </p>
      </div>
    </div>
  );
}
