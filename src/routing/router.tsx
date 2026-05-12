import { createBrowserRouter } from "react-router-dom";
import Auth from "../components/Auth";
import HomePage from "../components/HomePage";
import Layout from "../components/Layout";
import Lots from "../components/Lots";
import Products from "../components/Products";
import Warehouse from "../components/Warehouse";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/lots", element: <Lots /> },
      { path: "/products", element: <Products /> },
      { path: "/warehouses", element: <Warehouse /> },
    ],
  },
  { path: "/register", element: <Auth /> },
]);

export default router;
