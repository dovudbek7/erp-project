import { useQuery } from "@tanstack/react-query";
import { CACHE_KEY_LOTS_DETAIL } from "../constants";
import APICLIENT from "../services/apiClient";
import { type Lot } from "../types";

const useLotsDetail = (id: string) => {
  return useQuery<Lot, Error>({
    queryKey: [CACHE_KEY_LOTS_DETAIL, id],
    queryFn: new APICLIENT<Lot>(`lots/${id}`).get,
  });
};

export default useLotsDetail;
