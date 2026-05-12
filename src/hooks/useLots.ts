import { useQuery } from "@tanstack/react-query";
import { type Lot } from "../types";
import { CACHE_KEY_LOTS } from "../constants";
import APICLIENT from "../services/apiClient";
import lotService from "../services/lotService";

const useLots = () => {
  return useQuery<Lot[], Error>({
    queryKey: CACHE_KEY_LOTS,
    queryFn: lotService.getAll,
  });
};

export default useLots;
