import { useTranslation } from "react-i18next";
import { FiMenu } from "react-icons/fi";
import LangSelect from "./LangSelect";

interface Props {
  onMenu?: () => void;
}

const Navbar = ({ onMenu }: Props) => {
  const { t } = useTranslation();
  return (
    <div className="border-b-2 border-border p-4 flex justify-between px-4 md:px-[50px] items-center bg-white">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenu}
          className="md:hidden text-2xl text-black"
          aria-label="Open menu"
        >
          <FiMenu />
        </button>
        <p className="text-black">{t("navbar.content")}</p>
      </div>
      <LangSelect />
    </div>
  );
};

export default Navbar;
