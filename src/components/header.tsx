import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "./theme-toggle";
import { navData } from "@/constants/nav";
import { useLocation } from "react-router-dom";

// Define a type for the navigation item
type NavItem = {
  title: string;
  href: string;
  icon?: React.ComponentType;
  isActive?: boolean;
  items?: NavItem[];
};

export function Header() {
  const location = useLocation();

  const currentNavItem = navData.navItems.reduce<NavItem | null>(
    (bestMatch, item) => {
      if (
        location.pathname.startsWith(item.href) &&
        item.href.length > (bestMatch?.href.length || 0)
      ) {
        return item;
      }
      return bestMatch;
    },
    null
  );

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>
                {currentNavItem ? currentNavItem.title : "Home"}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="ml-auto px-4">
        <ModeToggle />
      </div>
    </header>
  );
}
