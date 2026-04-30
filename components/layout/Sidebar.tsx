"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
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
    <aside className="flex h-full w-56 flex-col" style={{ backgroundColor: "#1B3A2D" }}>
      {/* Logo */}
      <div className="flex flex-col items-center justify-center px-4 py-5 border-b border-white/10">
        <Image
          src="/tri-oak-logo.png"
          alt="Tri-Oak Consulting Group"
          width={140}
          height={56}
          className="object-contain"
          priority
        />
      </div>

      {/* Nav links */}
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
                  ? "text-white"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              )}
              style={active ? { backgroundColor: "#2D5A3D" } : undefined}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-4 py-3">
        <p className="text-xs text-white/40">Hopper Flow OS</p>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex border-t md:hidden"
      style={{ backgroundColor: "#1B3A2D", borderColor: "rgba(255,255,255,0.1)" }}
    >
      {nav.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href !== "/" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors",
              active ? "text-white" : "text-white/50"
            )}
          >
            <Icon className={cn("h-5 w-5", active ? "text-white" : "text-white/50")} />
            <span className="truncate">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
