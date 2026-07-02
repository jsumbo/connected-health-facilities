"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/public/brand-logo";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Building2,
  LogOut,
  Activity,
  Zap,
  AlertTriangle,
  Grid3x3,
  BarChart3,
  MapPin,
  CheckCircle,
  GraduationCap,
  MessageSquareHeart,
} from "lucide-react";
import clsx from "clsx";

const NAV = [
  // MAIN
  { href: "/dashboard", label: "Overview", icon: Activity, exact: true, section: "MAIN" },
  { href: "/dashboard/quick-wins", label: "Quick Wins", icon: Zap, section: "MAIN" },
  { href: "/dashboard/blockers", label: "Blockers", icon: AlertTriangle, section: "MAIN" },

  // EXPLORE
  { href: "/dashboard/readiness-heatmap", label: "Readiness Heatmap", icon: Grid3x3, section: "EXPLORE" },
  { href: "/dashboard/facilities", label: "Facilities", icon: Building2, section: "EXPLORE" },
  { href: "/dashboard/clusters", label: "Clusters", icon: Zap, section: "EXPLORE" },
  { href: "/dashboard/map", label: "Map", icon: MapPin, section: "EXPLORE" },

  // SURVEYS
  { href: "/dla", label: "Digital Literacy", icon: GraduationCap, section: "SURVEYS" },
  { href: "/sentiment", label: "Staff Sentiment", icon: MessageSquareHeart, section: "SURVEYS" },

  // ANALYSIS
  { href: "/dashboard/what-drives-readiness", label: "What Drives Readiness", icon: BarChart3, section: "ANALYSIS" },
  { href: "/dashboard/data-quality", label: "Data Quality", icon: CheckCircle, section: "ANALYSIS" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const facilityType = searchParams.get("facility_type");

  const hrefWithScope = (href: string) => {
    if (!facilityType) return href;
    return `${href}?facility_type=${encodeURIComponent(facilityType)}`;
  };

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-shell flex flex-col z-10">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-black/10">
        <BrandLogo href="/dashboard" priority />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-6 space-y-6">
        {["MAIN", "EXPLORE", "SURVEYS", "ANALYSIS"].map((section) => {
          const sectionItems = NAV.filter((item) => item.section === section);
          if (sectionItems.length === 0) return null;

          return (
            <div key={section}>
              <p className="px-4 mb-2 text-xs font-semibold uppercase text-slate-600">{section}</p>
              <div className="space-y-1">
                {sectionItems.map(({ href, label, icon: Icon, exact }) => {
                  const active = exact ? pathname === href : pathname.startsWith(href);
                  return (
                    <Link
                      key={href}
                      href={hrefWithScope(href)}
                      className={clsx(
                        "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                        active
                          ? "bg-teal text-white"
                          : "text-slate-700 hover:text-slate-900 hover:bg-black/10"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 pb-6 border-t border-black/10 pt-4">
        <p className="text-slate-600 text-xs px-4 mb-3">
          Ministry of Health · Sand Technologies
        </p>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 w-full rounded-lg text-sm text-slate-700 hover:text-slate-900 hover:bg-black/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
