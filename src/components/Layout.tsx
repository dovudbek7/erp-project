import { useState } from "react";
import { Outlet } from "react-router";
import Navbar from "./common/Navbar";
import { ToastProvider } from "./common/ToastContext";
import Dashboard from "./Dashboard";

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ToastProvider>
      <div className="grid md:grid-cols-[300px_1fr] min-h-screen">
        <Dashboard open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="col bg-background min-h-screen flex flex-col overflow-x-hidden">
          <Navbar onMenu={() => setSidebarOpen(true)} />
          <div className="container p-4 md:p-[35px_60px] flex-1 overflow-y-auto scrollbar-none mt-5">
            <Outlet />
          </div>
        </div>
      </div>
    </ToastProvider>
  );
}

export default Layout;
