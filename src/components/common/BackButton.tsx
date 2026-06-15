import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

interface Props {
  label?: string;
}

// Generic back affordance — goes to the previous history entry.
const BackButton = ({ label }: Props) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <button
      type="button"
      onClick={() => navigate(-1)}
      className="text-blue-600 text-sm mb-3 inline-flex items-center gap-1 hover:underline"
    >
      ← {label ?? t("common.back")}
    </button>
  );
};

export default BackButton;
