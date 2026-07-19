import type { ReactNode } from "react";
import { RiDashboardFill } from "react-icons/ri";
import { FaWarehouse, FaFileInvoiceDollar, FaShoppingCart } from "react-icons/fa";
import { BsFillBoxSeamFill } from "react-icons/bs";
import { MdOutlineInventory2 } from "react-icons/md";
import { GiMeatCleaver, GiCook } from "react-icons/gi";

export type SectionKey =
  | "dashboard"
  | "warehouse"
  | "lots"
  | "products"
  | "purchase-orders"
  | "production"
  | "recipes"
  | "sales-orders";

export interface SidebarSection {
  key: SectionKey;
  icon: ReactNode;
  labelKey: string;
  fallbackLabel: string;
  route: string;
}

export const SIDEBAR_SECTIONS: SidebarSection[] = [
  { key: "dashboard", icon: <RiDashboardFill />, labelKey: "sidebar.dashboard", fallbackLabel: "Dashboard", route: "/" },
  { key: "warehouse", icon: <FaWarehouse />, labelKey: "sidebar.wareHouse", fallbackLabel: "Warehouse", route: "/warehouses" },
  { key: "lots", icon: <BsFillBoxSeamFill />, labelKey: "sidebar.lots", fallbackLabel: "Lots", route: "/lots" },
  { key: "products", icon: <MdOutlineInventory2 />, labelKey: "sidebar.products", fallbackLabel: "Products", route: "/products" },
  { key: "purchase-orders", icon: <FaFileInvoiceDollar />, labelKey: "sidebar.purchaseOrders", fallbackLabel: "Purchase Orders", route: "/purchase-orders" },
  { key: "production", icon: <GiMeatCleaver />, labelKey: "sidebar.production", fallbackLabel: "Production", route: "/production/orders" },
  { key: "recipes", icon: <GiCook />, labelKey: "sidebar.recipes", fallbackLabel: "Recipes", route: "/recipes" },
  { key: "sales-orders", icon: <FaShoppingCart />, labelKey: "sidebar.salesOrders", fallbackLabel: "Sales Orders", route: "/sales/orders" },
];
