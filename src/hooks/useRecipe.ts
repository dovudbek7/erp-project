import { useQuery } from "@tanstack/react-query";
import { CACHE_KEY_RECIPE } from "../constants.production";
import recipeService from "../services/recipeService";
import { type RecipeWithIngredients } from "../types/production";

const useRecipe = (id: string) => {
  return useQuery<RecipeWithIngredients, Error>({
    queryKey: CACHE_KEY_RECIPE(id),
    queryFn: () => recipeService.get(id),
    enabled: !!id,
  });
};

export default useRecipe;
