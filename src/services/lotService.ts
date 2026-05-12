import { type Lot } from "../types";
import APICLIENT from "./apiClient";

export default new APICLIENT<Lot>("lots");
