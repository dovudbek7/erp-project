import { RiDashboardFill } from "react-icons/ri";
import {
  FaWarehouse,
  FaFileInvoiceDollar,
  FaShoppingCart,
} from "react-icons/fa";
import { BsFillBoxSeamFill } from "react-icons/bs";
import { GiMeatCleaver, GiCook } from "react-icons/gi";
import { TbReportAnalytics } from "react-icons/tb";
import { MdOutlineInventory2 } from "react-icons/md";
import { FiGitBranch } from "react-icons/fi";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface Props {
  open?: boolean;
  onClose?: () => void;
}

const Dashboard = ({ open = false, onClose }: Props) => {
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
      name: t("sidebar.production"),
      route: "/production/orders",
    },
    {
      id: 7,
      icon: <GiCook />,
      name: t("sidebar.recipes"),
      route: "/recipes",
    },
    {
      id: 11,
      icon: <FaShoppingCart />,
      name: "Sales Orders",
      route: "/sales/orders",
    },
    {
      id: 8,
      icon: <TbReportAnalytics />,
      name: t("sidebar.yieldReport"),
      route: "/reports/yield",
    },
    {
      id: 9,
      icon: <MdOutlineInventory2 />,
      name: t("sidebar.valuation"),
      route: "/reports/inventory-valuation",
    },
    {
      id: 10,
      icon: <FiGitBranch />,
      name: t("sidebar.traceability"),
      route: "/reports/traceability",
    },
  ];
  return (
    <div className="">
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <div
        className={`fixed top-0 left-0 bg-sidebar h-screen text-white py-5 w-[280px] md:w-[300px] z-50 overflow-y-auto scrollbar-none transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="border-b pl-5 pb-3 border-gray-400">
          <h2 className="font-bold">Andijan Meat Co</h2>
          <p className="font-thin text-gray-400">{t("sidebar.tagline")}</p>
        </div>

        <div className="py-5 px-4 flex flex-col gap-3">
          {sideItems.map((item) => (
            <NavLink
              to={item.route}
              key={item.id}
              onClick={onClose}
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
