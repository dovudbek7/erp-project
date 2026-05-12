import { type warehouse } from "../types";
import APICLIENT from "./apiClient";

export default new APICLIENT<warehouse>("warehouses");
