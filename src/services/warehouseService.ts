import { type Warehouse } from "../types";
import APICLIENT from "./apiClient";

export default new APICLIENT<Warehouse>("warehouses");
