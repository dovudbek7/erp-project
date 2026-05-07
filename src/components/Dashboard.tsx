import { RiDashboardFill } from "react-icons/ri";
import { FaWarehouse } from "react-icons/fa";
import { BsFillBoxSeamFill } from "react-icons/bs";
import { Link } from "react-router-dom";

const sideItems = [
  {
    id: 1,
    icon: <RiDashboardFill />,
    name: "Dashboard",
    route: "/",
  },
  {
    id: 2,
    icon: <FaWarehouse />,
    name: "WareHouse",
    route: "/warehouses",
  },
  {
    id: 3,
    icon: <BsFillBoxSeamFill />,
    name: "Lots",
    route: "/lots",
  },
  {
    id: 4,
    icon: <BsFillBoxSeamFill />,
    name: "Products",
    route: "/products",
  },
];
const Dashboard = () => {
  return (
    <div className="bg-sidebar text-white  py-5 h-screen max-w-[300px]">
      <div className="border-b pl-5 pb-3 border-gray-400">
        <h2 className="font-bold">Andijan Meat Co</h2>
        <p className="font-thin text-gray-400">Meat ERP</p>
      </div>

      <div className="py-5 px-4 flex flex-col gap-3">
        {sideItems.map((item) => (
          <Link
            to={item.route}
            key={item.id}
            className="hover:border hover:border-2 p-2 rounded-md hover:border-gray-400"
          >
            <div className="flex items-center gap-3 text-gray-400 hover:text-white">
              <span className="">{item.icon}</span>
              <span className="font-semibold">{item.name}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
