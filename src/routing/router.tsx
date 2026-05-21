import { createBrowserRouter } from "react-router-dom";
import Auth from "../components/Auth/Auth";
import HomePage from "../components/HomePage";
import Layout from "../components/Layout";
import Lots from "../components/Lots/Lots";
import Products from "../components/Products/Products";
import Warehouse from "../components/Warehouse/Warehouse";
import LotsDetail from "../components/Lots/LotsDetail";

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
      { path: "/warehouses", element: <Warehouse /> },
    ],
  },
  { path: "/register", element: <Auth /> },
]);

export default router;
