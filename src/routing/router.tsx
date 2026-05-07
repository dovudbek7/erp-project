import { createBrowserRouter } from "react-router-dom";
import HomePage from "../components/HomePage";
import Auth from "../components/Auth";
import Layout from "../components/Layout";
import Lot from "../components/Lot";
import Products from "../components/Products";
import Warehouse from "../components/Warehouse";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/lots", element: <Lot /> },
      { path: "/products", element: <Products /> },
      { path: "/warehouses", element: <Warehouse /> },
    ],
  },
  { path: "/register", element: <Auth /> },
]);

export default router;
