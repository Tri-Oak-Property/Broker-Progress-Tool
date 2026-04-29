import type { Metadata } from "next";
import "./globals.css";
import { Sidebar, MobileNav } from "@/components/layout/Sidebar";

export const metadata: Metadata = {
  title: "Hopper Flow OS | Tri-Oak Commercial",
  description: "Deal pipeline tracker for Tri-Oak Commercial Real Estate",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="h-full">
        <div className="flex h-full overflow-hidden">
          <div className="hidden md:flex md:flex-shrink-0">
            <Sidebar />
          </div>
          <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
            {children}
          </main>
        </div>
        <MobileNav />
      </body>
    </html>
  );
}
