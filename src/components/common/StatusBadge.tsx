import { Chip } from "@mui/material";

interface Props {
  status: string;
}
const Status = ({ status }: Props) => {
  let color:
    | "default"
    | "primary"
    | "secondary"
    | "error"
    | "info"
    | "success"
    | "warning" = "default";

  if (status === "AVAILABLE") color = "success";
  if (status === "RESERVED") color = "warning";
  if (status === "SOLD_OUT") color = "error";

  return (
    <Chip
      label={status}
      color={color}
      variant="outlined"
      size="small"
      sx={{ fontWeight: "bold", textTransform: "capitalize" }}
    />
  );
};

export default Status;
