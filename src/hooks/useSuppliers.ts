import { useQuery } from "@tanstack/react-query";
import { CACHE_KEY_SUPPLIERS } from "../constants";
import supplierService from "../services/supplierService";
import { type Supplier } from "../types";

const useSuppliers = () => {
  return useQuery<Supplier[], Error>({
    queryKey: CACHE_KEY_SUPPLIERS,
    queryFn: supplierService.getAll,
  });
};

export default useSuppliers;
