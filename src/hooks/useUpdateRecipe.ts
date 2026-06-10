import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CACHE_KEY_RECIPES } from "../constants.production";
import recipeService from "../services/recipeService";
import {
  type CreateRecipePayload,
  type RecipeWithIngredients,
} from "../types/production";

// Editing a published recipe creates a new version (the old one is
// deactivated server-side). Returns the freshly created version.
const useUpdateRecipe = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation<RecipeWithIngredients, Error, CreateRecipePayload>({
    mutationFn: (payload) => recipeService.newVersion(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CACHE_KEY_RECIPES });
    },
  });
};

export default useUpdateRecipe;
