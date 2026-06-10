import { createBrowserRouter } from "react-router-dom";
import Auth from "../components/Auth/Auth";
import HomePage from "../components/HomePage";
import Layout from "../components/Layout";
import Lots from "../components/Lots/Lots";
import Products from "../components/Products/Products";
import Warehouse from "../components/Warehouse/Warehouse";
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

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "/", element: <HomePage /> },
      {
        path: "/lots/",
        element: <Lots />,
      },
      { path: "/lots/:id", element: <LotsDetail /> },
      { path: "/products", element: <Products /> },
      { path: "/products/:id", element: <ProductDetail /> },
      { path: "/warehouses", element: <Warehouse /> },
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
    ],
  },
  { path: "/register", element: <Auth /> },
]);

export default router;
