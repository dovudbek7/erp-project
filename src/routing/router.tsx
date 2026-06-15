import { createBrowserRouter } from "react-router-dom";
import Auth from "../components/Auth/Auth";
import Layout from "../components/Layout";
import Lots from "../components/Lots/Lots";
import Products from "../components/Products/Products";
import Warehouse from "../components/Warehouse/Warehouse";
import WarehouseDetail from "../components/Warehouse/WarehouseDetail";
import LotsDetail from "../components/Lots/LotsDetail";
import ProductDetail from "../components/Products/ProductDetail";
import PurchaseOrders from "../components/PurchaseOrders/PurchaseOrders";
import PurchaseOrderDetail from "../components/PurchaseOrders/PurchaseOrderDetail";
import CreatePurchaseOrder from "../components/PurchaseOrders/CreatePurchaseOrder";
import ReceiveGoods from "../components/PurchaseOrders/ReceiveGoods";
import ProductionOrders from "../components/Production/ProductionOrders";
import NewProductionOrder from "../components/Production/NewProductionOrder";
import ProductionOrderDetail from "../components/Production/ProductionOrderDetail";
import Recipes from "../components/Recipes/Recipes";
import RecipeDetail from "../components/Recipes/RecipeDetail";
import RecipeForm from "../components/Recipes/RecipeForm";
import SalesOrders from "../components/Sales/SalesOrders";
import NewSalesOrder from "../components/Sales/NewSalesOrder";
import SalesOrderDetail from "../components/Sales/SalesOrderDetail";
import ReportsDashboard from "../components/Reports/ReportsDashboard";
import YieldReport from "../components/Reports/YieldReport";
import InventoryValuation from "../components/Reports/InventoryValuation";
import Traceability from "../components/Reports/Traceability";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "/", element: <ReportsDashboard /> },
      {
        path: "/lots/",
        element: <Lots />,
      },
      { path: "/lots/:id", element: <LotsDetail /> },
      { path: "/products", element: <Products /> },
      { path: "/products/:id", element: <ProductDetail /> },
      { path: "/warehouses", element: <Warehouse /> },
      { path: "/warehouses/:id", element: <WarehouseDetail /> },
      { path: "/purchase-orders", element: <PurchaseOrders /> },
      { path: "/purchase-orders/new", element: <CreatePurchaseOrder /> },
      { path: "/purchase-orders/:id", element: <PurchaseOrderDetail /> },
      { path: "/purchase-orders/:id/receive", element: <ReceiveGoods /> },
      { path: "/production/orders", element: <ProductionOrders /> },
      { path: "/production/orders/new", element: <NewProductionOrder /> },
      { path: "/production/orders/:id", element: <ProductionOrderDetail /> },
      { path: "/recipes", element: <Recipes /> },
      { path: "/recipes/new", element: <RecipeForm /> },
      { path: "/recipes/:id", element: <RecipeDetail /> },
      { path: "/recipes/:id/edit", element: <RecipeForm /> },
      { path: "/sales/orders", element: <SalesOrders /> },
      { path: "/sales/orders/new", element: <NewSalesOrder /> },
      { path: "/sales/orders/:id", element: <SalesOrderDetail /> },
      { path: "/reports/yield", element: <YieldReport /> },
      { path: "/reports/inventory-valuation", element: <InventoryValuation /> },
      { path: "/reports/traceability", element: <Traceability /> },
    ],
  },
  { path: "/register", element: <Auth /> },
]);

export default router;
