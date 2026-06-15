import { type Product } from "../types";
import APICLIENT from "./apiClient";

export default new APICLIENT<Product>("products");
