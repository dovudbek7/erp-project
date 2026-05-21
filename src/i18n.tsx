import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import english from "./assets/translations/English/translation.json";
import russian from "./assets/translations/Russian/translation.json";
import uzbek from "./assets/translations/Uzbek/translation.json";

const resources = {
  en: {
    translation: english,
  },
  ru: {
    translation: russian,
  },
  uz: {
    translation: uzbek,
  },
};

i18next
  .use(initReactI18next)
  .init({ resources, lng: localStorage.getItem("lang") || "en" });

export default i18next;
