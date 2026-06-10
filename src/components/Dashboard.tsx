import { RiDashboardFill } from "react-icons/ri";
import { FaWarehouse, FaFileInvoiceDollar } from "react-icons/fa";
import { BsFillBoxSeamFill } from "react-icons/bs";
import { GiMeatCleaver, GiCook } from "react-icons/gi";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Dashboard = () => {
  const { t } = useTranslation();

  const sideItems = [
    {
      id: 1,
      icon: <RiDashboardFill />,
      name: t("sidebar.dashboard"),
      route: "/",
    },
    {
      id: 2,
      icon: <FaWarehouse />,
      name: t("sidebar.wareHouse"),
      route: "/warehouses",
    },
    {
      id: 3,
      icon: <BsFillBoxSeamFill />,
      name: t("sidebar.lots"),
      route: "/lots",
    },
    {
      id: 4,
      icon: <BsFillBoxSeamFill />,
      name: t("sidebar.products"),
      route: "/products",
    },
    {
      id: 5,
      icon: <FaFileInvoiceDollar />,
      name: t("sidebar.purchaseOrders"),
      route: "/purchase-orders",
    },
    {
      id: 6,
      icon: <GiMeatCleaver />,
      name: "Production",
      route: "/production/orders",
    },
    {
      id: 7,
      icon: <GiCook />,
      name: "Recipes",
      route: "/recipes",
    },
  ];
  return (
    <div className="">
      <div className="fixed bg-sidebar h-screen bg-sidebar text-white py-5 w-[300px]">
        <div className="border-b pl-5 pb-3 border-gray-400">
          <h2 className="font-bold">Andijan Meat Co</h2>
          <p className="font-thin text-gray-400">Meat ERP</p>
        </div>

        <div className="py-5 px-4 flex flex-col gap-3">
          {sideItems.map((item) => (
            <NavLink
              to={item.route}
              key={item.id}
              className="hover:outline hover:outline-2 p-2 rounded-md hover:border-gray-400"
            >
              <div className="flex items-center gap-3 text-gray-400 hover:text-white">
                <span className="">{item.icon}</span>
                <span className="font-semibold">{item.name}</span>
              </div>
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
