import { type Tenant } from "../types";
import APICLIENT from "./apiClient";

export default new APICLIENT<Tenant>("tenant");
