import { useTranslation } from "react-i18next";

const LangSelect = () => {
  const { i18n } = useTranslation();
  const onChangeLang = (e: any) => {
    const language = e.target.value;
    localStorage.setItem("lang", language);
    i18n.changeLanguage(language);
  };
  return (
    <select
      name=""
      id=""
      onChange={onChangeLang}
      className="bg-border p-[3px_10px] rounded-lg"
      value={localStorage.getItem("lang") || "en"}
    >
      <option value="en">English 🇺🇸</option>
      <option value="ru">Russian 🇷🇺 </option>
      <option value="uz">Uzbek 🇺🇿</option>
    </select>
  );
};

export default LangSelect;
