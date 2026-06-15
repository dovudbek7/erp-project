import axios from "axios";
import type { Recipe } from "../types";
import type {
  RecipeWithIngredients,
  CreateRecipePayload,
} from "../types/production";

const api = axios.create({ baseURL: "/api/" });

const recipeService = {
  list: () => api.get<Recipe[]>("recipes").then((r) => r.data),

  get: (id: string) =>
    api.get<RecipeWithIngredients>(`recipes/${id}`).then((r) => r.data),

  create: (payload: CreateRecipePayload) =>
    api
      .post<RecipeWithIngredients>("recipes", payload)
      .then((r) => r.data),

  // Editing a published recipe creates a new version on the server.
  newVersion: (id: string, payload: CreateRecipePayload) =>
    api
      .post<RecipeWithIngredients>(`recipes/${id}/new-version`, payload)
      .then((r) => r.data),
};

export default recipeService;
