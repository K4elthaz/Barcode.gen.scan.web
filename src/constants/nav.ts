import {
  LayoutList,
  CircleUser,
  ScanBarcode,
  Layers
} from "lucide-react";
// import { title } from "process";
// import { href } from "react-router-dom";

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
      icon: Layers,
      isActive: true,
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
    }
  ],
};