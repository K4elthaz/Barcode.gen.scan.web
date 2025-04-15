import * as React from "react";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { navData } from "@/constants/nav";
import AppLogo from "./app-logo";
import { auth } from "@/lib/firebase";
import { useNavigate } from "react-router-dom";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate("/");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex justify-center items-center w-full">
          <AppLogo size={150} />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navData.navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={navData.user} handleLogout={handleLogout} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
