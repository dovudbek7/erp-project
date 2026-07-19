import { MenuItem, Select, type SelectChangeEvent } from "@mui/material";
import { useTranslation } from "react-i18next";

const LANGS = [
  { code: "uz", label: "Uzbek", flag: "🇺🇿" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "ru", label: "Russian", flag: "🇷🇺" },
];

const LangSelect = () => {
  const { i18n } = useTranslation();

  const onChangeLang = (e: SelectChangeEvent) => {
    const language = e.target.value;
    localStorage.setItem("lang", language);
    i18n.changeLanguage(language);
  };

  return (
    <Select
      size="small"
      fullWidth
      value={localStorage.getItem("lang") || "en"}
      onChange={onChangeLang}
      sx={{
        color: "rgba(255,255,255,0.7)",
        fontSize: 14,
        ".MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.12)" },
        "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.25)" },
        "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.35)" },
        ".MuiSvgIcon-root": { color: "rgba(255,255,255,0.4)" },
      }}
    >
      {LANGS.map((l) => (
        <MenuItem key={l.code} value={l.code}>
          {l.label} {l.flag}
        </MenuItem>
      ))}
    </Select>
  );
};

export default LangSelect;
