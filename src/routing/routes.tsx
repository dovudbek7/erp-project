import { createBrowserRouter } from "react-router-dom"
import HomePage from "../components/HomePage"
import Auth from "../components/Auth"

const router = createBrowserRouter([
  { path: "/", element: <HomePage /> },
  { path: "/register", element: <Auth /> },
])

export default router
