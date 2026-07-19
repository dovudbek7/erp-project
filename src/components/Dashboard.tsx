import { FaUsers } from "react-icons/fa";
import { FiLogOut, FiUser } from "react-icons/fi";
import { GiCow } from "react-icons/gi";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SIDEBAR_SECTIONS } from "../constants.sections";
import { useAuth } from "../context/AuthContext";
import LangSelect from "./common/LangSelect";
import type { ReactNode } from "react";

interface SideItem {
  id: string;
  icon: ReactNode;
  name: string;
  route: string;
}

interface Props {
  open?: boolean;
  onClose?: () => void;
}

const Dashboard = ({ open = false, onClose }: Props) => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const isAdmin = user?.role === "admin";

  const sideItems: SideItem[] = SIDEBAR_SECTIONS.filter(
    (section) => isAdmin || user?.permissions?.includes(section.key)
  ).map((section) => ({
    id: section.key,
    icon: section.icon,
    name: t(section.labelKey, { defaultValue: section.fallbackLabel }),
    route: section.route,
  }));

  if (isAdmin) {
    sideItems.push({
      id: "users",
      icon: <FaUsers />,
      name: t("sidebar.users", { defaultValue: "Users" }),
      route: "/users",
    });
  }

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
        className={`fixed top-0 left-0 flex flex-col bg-sidebar h-screen text-white w-[280px] md:w-[300px] z-50 transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-error text-lg">
            <GiCow />
          </div>
          <div className="min-w-0">
            <h2 className="font-bold leading-tight truncate">Andijan Meat Co</h2>
            <p className="text-xs text-white/40 truncate">{t("sidebar.tagline")}</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto scrollbar-none px-3 py-4 flex flex-col gap-1">
          {sideItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.route}
              end={item.route === "/"}
              onClick={onClose}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-white/50 hover:bg-white/5 hover:text-white/90"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-error transition-opacity ${
                      isActive ? "opacity-100" : "opacity-0"
                    }`}
                  />
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center text-[17px]">
                    {item.icon}
                  </span>
                  <span className="truncate">{item.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 px-4 py-4 flex flex-col gap-3">
          <LangSelect />
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10">
              <FiUser className="text-sm text-white/60" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white/90 truncate">
                {user?.fullName || user?.username || user?.phone}
              </p>
              <p className="text-xs text-white/40 truncate">
                {t(`enums.${user?.role}`, { defaultValue: user?.role })}
              </p>
            </div>
            <button
              type="button"
              onClick={logout}
              aria-label={t("sidebar.logout", { defaultValue: "Logout" })}
              title={t("sidebar.logout", { defaultValue: "Logout" })}
              className="shrink-0 flex h-8 w-8 items-center justify-center rounded-lg text-white/50 hover:bg-error/20 hover:text-error transition-colors"
            >
              <FiLogOut className="text-base" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
