import { type PurchaseOrder } from "../types";
import APICLIENT from "./apiClient";

export default new APICLIENT<PurchaseOrder>("purchase-orders");
