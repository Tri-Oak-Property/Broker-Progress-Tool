export const dynamic = "force-dynamic";
import { getAdvisors } from "@/actions/advisors";
import { AdvisorManager } from "@/components/advisors/AdvisorManager";

export default async function SettingsPage() {
  const advisors = await getAdvisors();
  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-xl font-bold text-slate-900">Settings</h1>
      <AdvisorManager advisors={advisors} />
      <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-3">
        <h2 className="font-semibold text-slate-900">Database</h2>
        <p className="text-sm text-slate-600">
          To seed the database with Tri-Oak's initial deal data, run:
        </p>
        <pre className="bg-slate-100 rounded-md px-3 py-2 text-xs font-mono text-slate-700 overflow-x-auto">
          npm run db:seed
        </pre>
        <p className="text-xs text-slate-400">
          Requires DATABASE_URL set in .env.local. Will clear existing data.
        </p>
      </div>
    </div>
  );
}
