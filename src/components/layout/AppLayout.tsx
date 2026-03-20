import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <TopNav />
      {/* ml-56 = sidebar width, pt-14 = top nav height */}
      <main className="ml-56 pt-14 min-h-screen">
        <div className="mx-auto max-w-6xl px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
