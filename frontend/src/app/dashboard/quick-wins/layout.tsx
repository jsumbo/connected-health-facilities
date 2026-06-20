import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";

async function verifyAdminAuth(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("auth_token")?.value ?? null;
}

export default async function QuickWinsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = await verifyAdminAuth();
  if (!token) redirect("/login");

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 ml-64 overflow-auto">
        <div className="py-8 px-4">{children}</div>
      </main>
    </div>
  );
}
