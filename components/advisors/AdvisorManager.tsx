"use client";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createAdvisor, updateAdvisor } from "@/actions/advisors";
import type { Advisor } from "@/lib/db/schema";
import { Plus, Pencil, Check, X } from "lucide-react";
import { useRouter } from "next/navigation";

function EditRow({
  advisor,
  onDone,
}: {
  advisor: Advisor;
  onDone: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [firstName, setFirstName] = useState(advisor.firstName);
  const [lastName, setLastName] = useState(advisor.lastName);
  const [email, setEmail] = useState(advisor.email ?? "");
  const router = useRouter();

  function save() {
    startTransition(async () => {
      await updateAdvisor(advisor.id, {
        firstName,
        lastName,
        email,
        active: advisor.active,
      });
      router.refresh();
      onDone();
    });
  }

  function toggleActive() {
    startTransition(async () => {
      await updateAdvisor(advisor.id, {
        firstName: advisor.firstName,
        lastName: advisor.lastName,
        email: advisor.email ?? "",
        active: !advisor.active,
      });
      router.refresh();
      onDone();
    });
  }

  return (
    <tr className="border-b border-slate-100 bg-blue-50/30">
      <td className="px-4 py-2">
        <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="h-8 text-sm" />
      </td>
      <td className="px-4 py-2">
        <Input value={lastName} onChange={(e) => setLastName(e.target.value)} className="h-8 text-sm" />
      </td>
      <td className="px-4 py-2">
        <Input value={email} onChange={(e) => setEmail(e.target.value)} className="h-8 text-sm" placeholder="email@example.com" />
      </td>
      <td className="px-4 py-2">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${advisor.active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
          {advisor.active ? "Active" : "Inactive"}
        </span>
      </td>
      <td className="px-4 py-2">
        <div className="flex gap-1">
          <Button size="sm" onClick={save} disabled={isPending}><Check className="h-3.5 w-3.5" /></Button>
          <Button size="sm" variant="outline" onClick={onDone}><X className="h-3.5 w-3.5" /></Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-xs text-slate-500"
            onClick={toggleActive}
            disabled={isPending}
          >
            {advisor.active ? "Deactivate" : "Activate"}
          </Button>
        </div>
      </td>
    </tr>
  );
}

export function AdvisorManager({ advisors }: { advisors: Advisor[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [newFirst, setNewFirst] = useState("");
  const [newLast, setNewLast] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  function addAdvisor() {
    if (!newFirst.trim() || !newLast.trim()) {
      setError("First name and last name are required.");
      return;
    }
    setError("");
    startTransition(async () => {
      await createAdvisor({ firstName: newFirst, lastName: newLast, email: newEmail });
      setNewFirst("");
      setNewLast("");
      setNewEmail("");
      setShowAdd(false);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-slate-900">Advisors</h2>
        <Button size="sm" onClick={() => setShowAdd(true)} className="gap-1.5">
          <Plus className="h-4 w-4" />
          Add Advisor
        </Button>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              {["First Name", "Last Name", "Email", "Status", ""].map((h) => (
                <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {showAdd && (
              <tr className="border-b border-slate-100 bg-green-50/30">
                <td className="px-4 py-2">
                  <Input
                    value={newFirst}
                    onChange={(e) => setNewFirst(e.target.value)}
                    placeholder="First name"
                    className="h-8 text-sm"
                    autoFocus
                  />
                </td>
                <td className="px-4 py-2">
                  <Input
                    value={newLast}
                    onChange={(e) => setNewLast(e.target.value)}
                    placeholder="Last name"
                    className="h-8 text-sm"
                  />
                </td>
                <td className="px-4 py-2">
                  <Input
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="h-8 text-sm"
                    type="email"
                  />
                </td>
                <td className="px-4 py-2">
                  <span className="text-xs text-slate-400">New</span>
                </td>
                <td className="px-4 py-2">
                  <div className="flex gap-1">
                    <Button size="sm" onClick={addAdvisor} disabled={isPending}><Check className="h-3.5 w-3.5" /></Button>
                    <Button size="sm" variant="outline" onClick={() => { setShowAdd(false); setError(""); }}><X className="h-3.5 w-3.5" /></Button>
                  </div>
                </td>
              </tr>
            )}
            {error && (
              <tr>
                <td colSpan={5} className="px-4 py-2 text-sm text-red-600">{error}</td>
              </tr>
            )}
            {advisors.map((advisor) =>
              editingId === advisor.id ? (
                <EditRow key={advisor.id} advisor={advisor} onDone={() => setEditingId(null)} />
              ) : (
                <tr key={advisor.id} className={`border-b border-slate-100 last:border-0 ${!advisor.active ? "opacity-50" : ""}`}>
                  <td className="px-4 py-2.5 font-medium text-slate-900">{advisor.firstName}</td>
                  <td className="px-4 py-2.5 text-slate-700">{advisor.lastName}</td>
                  <td className="px-4 py-2.5 text-slate-500">{advisor.email || "—"}</td>
                  <td className="px-4 py-2.5">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${advisor.active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                      {advisor.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <Button variant="ghost" size="sm" onClick={() => setEditingId(advisor.id)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
