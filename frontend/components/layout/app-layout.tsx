import { TopNavigation } from "@/components/navigation/top-navigation";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <TopNavigation />
      <main className="page-container">{children}</main>
    </div>
  );
}
