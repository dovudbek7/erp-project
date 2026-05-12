import { Outlet } from "react-router";
import Dashboard from "./Dashboard";

function Layout() {
  return (
    <div>
      <div className="grid grid-cols-[300px_1fr]">
        <Dashboard />
        <div className="col">
          <div className="bg-gray-300 p-4 text-white">Content Area</div>

          <div className="p-[35px_60px]">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Layout;
