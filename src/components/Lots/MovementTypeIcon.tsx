import { BiSolidPurchaseTagAlt } from "react-icons/bi";
import { BsWrenchAdjustableCircle } from "react-icons/bs";
import { MdOutlineOutput } from "react-icons/md";
import { TbTruckDelivery } from "react-icons/tb";
import type { StockMovementType } from "../../types";

interface Props {
  type: StockMovementType;
}

const colorMap: Record<StockMovementType, string> = {
  RECEIPT: "text-green-600 border-green-600",
  PRODUCTION_OUTPUT: "text-blue-600 border-blue-600",
  PRODUCTION_INPUT: "text-yellow-500 border-yellow-500",
  SALE: "text-red-500 border-red-500",
  ADJUSTMENT: "text-gray-500 border-gray-500",
};

const iconData = {
  RECEIPT: <TbTruckDelivery />,
  PRODUCTION_OUTPUT: <MdOutlineOutput />,
  PRODUCTION_INPUT: "-",
  SALE: <BiSolidPurchaseTagAlt />,
  ADJUSTMENT: <BsWrenchAdjustableCircle />,
};
const MovementIcon = ({ type }: Props) => {
  const classes = colorMap[type] ?? "text-gray-400 border-gray-400";
  return (
    <span
      className={`${classes} border-2 flex items-center justify-center rounded-full p-[3px] w-[20px] h-[20px]`}
    >
      {iconData[type]}
    </span>
  );
};

export default MovementIcon;
