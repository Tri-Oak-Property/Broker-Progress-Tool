"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  CalendarDays,
  Users,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/deals", label: "Deals", icon: FileText },
  { href: "/weekly", label: "Weekly Flow", icon: CalendarDays },
  { href: "/advisors", label: "Scorecards", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="flex h-full w-56 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-14 items-center border-b border-slate-200 px-4">
        <span className="font-bold text-slate-900 text-sm tracking-tight">Hopper Flow OS</span>
      </div>
      <nav className="flex flex-col gap-0.5 p-3 flex-1">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-slate-200 p-4">
        <p className="text-xs text-slate-400">Tri-Oak Commercial</p>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-slate-200 bg-white md:hidden">
      {nav.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href !== "/" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors",
              active ? "text-slate-900" : "text-slate-400"
            )}
          >
            <Icon className={cn("h-5 w-5", active ? "text-slate-900" : "text-slate-400")} />
            <span className="truncate">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
