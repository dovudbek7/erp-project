import { useQuery } from "@tanstack/react-query";
import { STOCK_MOVEMENTS } from "../constants";
import APICLIENT from "../services/apiClient";
import { type StockMovement } from "../types";

const useMovements = (query: string) => {
  return useQuery<StockMovement[], Error>({
    queryKey: STOCK_MOVEMENTS,
    queryFn: new APICLIENT<StockMovement>(`stock-movements?lotId=${query}`)
      .getAll,
  });
};

export default useMovements;
