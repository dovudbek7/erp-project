import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { FiMenu } from "react-icons/fi";
import { RiDashboardFill } from "react-icons/ri";
import { SIDEBAR_SECTIONS } from "../../constants.sections";

interface Props {
  onMenu?: () => void;
}

const usePageHeading = () => {
  const { pathname } = useLocation();
  const { t } = useTranslation();

  return useMemo(() => {
    if (pathname === "/") {
      return { icon: <RiDashboardFill />, title: t("sidebar.dashboard") };
    }
    if (pathname.startsWith("/users")) {
      return { icon: <RiDashboardFill />, title: t("sidebar.users", { defaultValue: "Users" }) };
    }
    const match = SIDEBAR_SECTIONS.filter(
      (s) => s.route !== "/" && pathname.startsWith(s.route)
    ).sort((a, b) => b.route.length - a.route.length)[0];

    return match
      ? { icon: match.icon, title: t(match.labelKey, { defaultValue: match.fallbackLabel }) }
      : { icon: <RiDashboardFill />, title: t("sidebar.dashboard") };
  }, [pathname, t]);
};

const Navbar = ({ onMenu }: Props) => {
  const { icon, title } = usePageHeading();

  return (
    <div className="border-b-2 border-border p-4 flex justify-between px-4 md:px-[50px] items-center bg-white">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onMenu}
          className="md:hidden text-2xl text-black shrink-0"
          aria-label="Open menu"
        >
          <FiMenu />
        </button>
        <span className="hidden sm:flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-error/10 text-error text-base">
          {icon}
        </span>
        <h1 className="text-lg font-semibold text-black truncate">{title}</h1>
      </div>

      {/* Greeting + date — parked for now, re-enable once we have real content for this slot
      <div className="flex items-center gap-4">
        <div className="hidden md:flex flex-col items-end leading-tight">
          <span className="text-sm font-medium text-black">
            {t("navbar.hello", { defaultValue: "Salom" })}, {user?.username}
          </span>
          <span className="text-xs text-gray-400 capitalize">
            {moment().format("D MMMM, YYYY")}
          </span>
        </div>
      </div>
      */}
    </div>
  );
};

export default Navbar;
