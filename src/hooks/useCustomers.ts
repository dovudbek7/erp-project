import { useQuery } from "@tanstack/react-query";
import { CACHE_KEY_CUSTOMERS } from "../constants.sales";
import customerService from "../services/customerService";
import type { Customer } from "../types";

const useCustomers = () => {
  return useQuery<Customer[], Error>({
    queryKey: CACHE_KEY_CUSTOMERS,
    queryFn: () => customerService.list(),
  });
};

export default useCustomers;
