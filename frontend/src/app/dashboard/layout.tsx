import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import Sidebar from "@/components/Sidebar";
import { DashboardScopeBar } from "@/components/dashboard-scope-bar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) redirect("/login");

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Suspense fallback={<aside className="fixed left-0 top-0 h-full w-64 bg-shell" />}>
        <Sidebar />
      </Suspense>
      <main className="flex-1 ml-64 p-8 overflow-auto">
        <DashboardScopeBar />
        {children}
      </main>
    </div>
  );
}
