import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Header } from "@/components/header";
import { Outlet } from "react-router-dom";

export default function MainPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-[radial-gradient(circle_at_top_left,_hsl(var(--accent)/0.18),_transparent_32%),radial-gradient(circle_at_bottom_right,_hsl(var(--secondary)/0.12),_transparent_28%),hsl(var(--background))]">
        <main className="relative w-full flex-1 overflow-hidden">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-primary/10 to-transparent" />
          <Header />
          <div className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 pb-6 pt-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
