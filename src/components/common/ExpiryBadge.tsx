import { Chip } from "@mui/material";
import moment from "moment";
interface Props {
  expiryDate: string;
}
const ExpiryBadge = ({ expiryDate }: Props) => {
  let d = new Date();
  let year = d.getFullYear();
  let month = d.getMonth() + 1;
  let day = d.getUTCDate();
  const now = year + "-" + month + "-" + day;

  const eDate = moment(expiryDate);

  const total = eDate.diff(now, "days");

  const expired = total > 0 ? total + "D Left" : "Expired";

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
