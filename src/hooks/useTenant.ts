import { useQuery } from "@tanstack/react-query";
import { CACHE_TENANT } from "../constants";
import tenantService from "../services/tenantService";
import { type Tenant } from "../types";

const useTenant = () => {
  return useQuery<Tenant[], Error>({
    queryKey: CACHE_TENANT,
    queryFn: tenantService.getAll,
  });
};

export default useTenant;
