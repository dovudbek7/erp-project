import { useQuery } from "@tanstack/react-query";
import { CACHE_KEY_RECIPES } from "../constants.production";
import recipeService from "../services/recipeService";
import { type Recipe } from "../types";

const useRecipes = () => {
  return useQuery<Recipe[], Error>({
    queryKey: CACHE_KEY_RECIPES,
    queryFn: recipeService.list,
  });
};

export default useRecipes;
