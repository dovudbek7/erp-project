import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const api = axios.create({ baseURL: "/api/" });

// Deletes a set of ids from one collection endpoint, then invalidates its list.
const useBulkDelete = (endpoint: string, queryKey: unknown[]) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string[]>({
    mutationFn: (ids) =>
      Promise.all(ids.map((id) => api.delete(`${endpoint}/${id}`))).then(
        () => undefined,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
};

export default useBulkDelete;
