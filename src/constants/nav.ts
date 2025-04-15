import {
  Users,
  LayoutDashboard,
  SquareUserRound
} from "lucide-react";

export const navData = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navItems: [
    {
      title: "Inventory",
      href: "/main",
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: "Scan Barcode",
      href: "/main/classroom",
      icon: SquareUserRound,
    },
    {
      title: "Users",
      href: "/main/users",
      icon: Users,
    },
  ],
};
