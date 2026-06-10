import { useQuery } from "@tanstack/react-query";
import { CACHE_KEY_PRODUCTS_DETAIL } from "../constants";
import APICLIENT from "../services/apiClient";
import { type Product } from "../types";

const useProductsDetail = (id: string) => {
  return useQuery<Product, Error>({
    queryKey: [CACHE_KEY_PRODUCTS_DETAIL, id],
    queryFn: new APICLIENT<Product>(`products/${id}`).get,
  });
};

export default useProductsDetail;
