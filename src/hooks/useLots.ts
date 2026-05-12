import { useQuery } from "@tanstack/react-query";
import { CACHE_KEY_LOTS } from "../constants";
import lotService from "../services/lotService";
import { type Lot } from "../types";

const useLots = () => {
  return useQuery<Lot[], Error>({
    queryKey: CACHE_KEY_LOTS,
    queryFn: lotService.getAll,
  });
};

export default useLots;
