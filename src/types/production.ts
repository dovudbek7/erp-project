// Request/response helper types for the production + recipe screens.
// Kept in a separate file from src/types/index.ts to avoid edit
// collisions with the parallel purchase-orders work. The base entity
// types (Recipe, ProductionOrder, etc.) live in index.ts.
import type {
  Recipe,
  RecipeIngredient,
  ProductionOrder,
  ProductionOrderInput,
  ConsumedLot,
  Lot,
  StockMovement,
} from ".";

export type RecipeWithIngredients = Recipe & {
  ingredients: RecipeIngredient[];
};

export type ProductionOrderWithDetail = ProductionOrder & {
  inputs: ProductionOrderInput[];
  recipe: RecipeWithIngredients | null;
  outputLot: Lot | null;
  movements: StockMovement[];
};

export interface SuggestedLot {
  lotId: string;
  lotNumber: string;
  availableQuantity: string;
  expiryDate: string;
  unitCost: string;
  warehouseId: string;
  suggestedQuantity: string;
}

export interface SuggestLotsResponse {
  productId: string;
  requestedQuantity: string;
  shortfall: string;
  suggestions: SuggestedLot[];
}

export interface PatchInputPayload {
  actualQuantity?: string | null;
  consumedLots?: ConsumedLot[];
  notes?: string | null;
}

export interface CompleteProductionPayload {
  actualOutputQuantity: string;
  outputLotNumber: string;
  expiryDate: string;
  outputWarehouseId: string;
  notes?: string | null;
}

export interface CreateProductionOrderPayload {
  recipeId: string;
  warehouseId: string;
  plannedOutputQuantity: string;
  scheduledFor: string;
  notes?: string | null;
}

export interface CreateRecipeIngredient {
  productId: string;
  quantity: string;
  uom: string;
  isOptional: boolean;
  notes?: string | null;
}

export interface CreateRecipePayload {
  code: string;
  name: string;
  outputProductId: string;
  outputQuantity: number;
  outputUom: string;
  expectedYieldPercent: number;
  notes?: string | null;
  ingredients: CreateRecipeIngredient[];
}
