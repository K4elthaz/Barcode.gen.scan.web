import {
  LayoutDashboard,
  LayoutList,
  CircleUser,
  ScanBarcode,
  Layers,
  SquareStack,
} from "lucide-react";

export const navData = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navItems: [
    {
      title: "Overview",
      href: "/main",
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: "Inventory",
      href: "/main/inventory",
      icon: Layers,
    },
    {
      title: "Scan Barcode",
      href: "/main/scanbarcode",
      icon: ScanBarcode,
    },
    {
      title: "Category",
      href: "/main/category",
      icon: LayoutList,
    },
    {
      title: "Supplier",
      href: "/main/supplier",
      icon: CircleUser,
    },
    {
      title: "Audit Trail",
      href: "/main/auditTrail",
      icon: SquareStack,
    },
  ],
};