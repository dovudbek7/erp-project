import { Outlet } from "react-router";
import Navbar from "./common/Navbar";
import { ToastProvider } from "./common/ToastContext";
import Dashboard from "./Dashboard";

function Layout() {
  return (
    <ToastProvider>
      <div className="grid grid-cols-[300px_1fr] max-h-[100px]">
        <Dashboard />
        <div className="col bg-background h-screen">
          <Navbar />
          <div className="container p-[35px_60px] max-h-[800px]  overflow-scroll scrollbar-none mt-5">
            <Outlet />
          </div>
        </div>
      </div>
    </ToastProvider>
  );
}

export default Layout;
