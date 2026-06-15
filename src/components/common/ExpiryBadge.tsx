import { Chip } from "@mui/material";
import moment from "moment";
import { useTranslation } from "react-i18next";
interface Props {
  expiryDate: string;
}
const ExpiryBadge = ({ expiryDate }: Props) => {
  const { t } = useTranslation();
  const d = new Date();
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getUTCDate();
  const now = year + "-" + month + "-" + day;

  const eDate = moment(expiryDate);

  const total = eDate.diff(now, "days");

  const expired =
    total > 0 ? t("expiry.left", { n: total }) : t("expiry.expired");

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <Chip
        label={expired}
        color={total < 0 ? "error" : total > 7 ? "default" : "warning"}
        variant="outlined"
        size="small"
        className=""
      />

    </div>
  );
};

export default ExpiryBadge;
