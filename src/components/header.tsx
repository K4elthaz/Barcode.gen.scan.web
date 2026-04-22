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
import { format } from "date-fns";

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
  const todayLabel = format(new Date(), "EEEE, MMMM d");

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
    <header className="sticky top-0 z-20 shrink-0 border-b border-border/60 bg-background/80 backdrop-blur-xl transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="h-5" />
        <div className="min-w-0">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage className="truncate text-base font-semibold">
                  {currentNavItem ? currentNavItem.title : "Home"}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <p className="text-xs text-muted-foreground">
            Live inventory view for receiving, tracking, and audit work.
          </p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div className="hidden rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary sm:block">
            {todayLabel}
          </div>
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
