import { useTranslation } from "react-i18next";
import LangSelect from "./LangSelect";

const Navbar = () => {
  const { t } = useTranslation();
  return (
    <div className="border-b-2 border-border p-4 flex justify-between px-[50px] items-center bg-white">
      <p className="text-black">{t("navbar.content")}</p>
      <LangSelect />
    </div>
  );
};

export default Navbar;
