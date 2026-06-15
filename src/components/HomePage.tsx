import { useTranslation } from "react-i18next";

const HomePage = () => {
  const { t } = useTranslation();

  return (
    <>
      <p>{t("name")}</p>
    </>
  );
};

export default HomePage;
