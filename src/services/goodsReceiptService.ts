import { type GoodsReceipt } from "../types";
import APICLIENT from "./apiClient";

export default new APICLIENT<GoodsReceipt>("goods-receipts");
