import { Outlet } from "react-router";
import Navbar from "./common/Navbar";
import Dashboard from "./Dashboard";

function Layout() {
  return (
    <div>
      <div className="grid grid-cols-[300px_1fr]">
        <Dashboard />
        <div className="col bg-background h-screen">
          <Navbar />
          <div className="container p-[35px_60px] ">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Layout;
