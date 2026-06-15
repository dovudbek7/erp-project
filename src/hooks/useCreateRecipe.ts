import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CACHE_KEY_RECIPES } from "../constants.production";
import recipeService from "../services/recipeService";
import {
  type CreateRecipePayload,
  type RecipeWithIngredients,
} from "../types/production";

const useCreateRecipe = () => {
  const queryClient = useQueryClient();
  return useMutation<RecipeWithIngredients, Error, CreateRecipePayload>({
    mutationFn: (payload) => recipeService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CACHE_KEY_RECIPES });
    },
  });
};

export default useCreateRecipe;
