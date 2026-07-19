import { useState } from "react";
import { Outlet } from "react-router";
import { FiMenu } from "react-icons/fi";
// import Navbar from "./common/Navbar"; // parked for now — re-enable once we decide what goes in it
import { ToastProvider } from "./common/ToastContext";
import Dashboard from "./Dashboard";

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ToastProvider>
      <div className="grid md:grid-cols-[300px_1fr] min-h-screen">
        <Dashboard open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="col bg-background min-h-screen flex flex-col overflow-x-hidden">
          {/* Navbar parked for now — re-enable once we decide what goes in it.
          <Navbar onMenu={() => setSidebarOpen(true)} />
          */}
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="md:hidden text-2xl text-black p-4"
            aria-label="Open menu"
          >
            <FiMenu />
          </button>
          <div className="container p-4 md:p-[35px_60px] flex-1 overflow-y-auto scrollbar-none mt-5">
            <Outlet />
          </div>
        </div>
      </div>
    </ToastProvider>
  );
}

export default Layout;
