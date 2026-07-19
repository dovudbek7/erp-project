export interface MockMeta {
  generatedFor: string;
  anchorDate: string;
  currency: string;
  notes: string;
}

export interface Tenant {
  id: string;
  name: string;
  legalName: string;
  taxId: string;
  defaultCurrency: string;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

export type UserRole =
  | "admin"
  | "production_manager"
  | "warehouse_operator"
  | "sales"
  | "accountant"
  | "staff";

export interface User {
  id: string;
  tenantId: string;
  username: string | null;
  email: string | null;
  phone: string | null;
  fullName: string;
  role: UserRole;
  permissions: string[];
  isActive: boolean;
  lastLoginAt: string;
  createdAt: string;
  updatedAt: string;
}

export type ProductType = "RAW_MATERIAL" | "PACKAGING" | "FINISHED_GOOD";

export interface Product {
  id: string;
  tenantId: string;
  sku: string
  name: string;
  type: ProductType;
  uom: string;
  shelfLifeDays: number | null;
  category: string;
  barcode: string | null;
  isActive: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Warehouse {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  type: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  taxId: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  paymentTermsDays: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CustomerType = "RETAIL" | "WHOLESALE" | "RESTAURANT" | "DISTRIBUTOR";

export interface Customer {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  type: CustomerType;
  taxId: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  paymentTermsDays: number;
  creditLimit: string;
  priceListId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PriceList {
  id: string;
  tenantId: string;
  name: string;
  currency: string;
  validFrom: string;
  validTo: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PriceListItem {
  id: string;
  tenantId: string;
  priceListId: string;
  productId: string;
  unitPrice: string;
  minQuantity: string | null;
}

export type PurchaseOrderStatus =
  | "DRAFT"
  | "RECEIVED"
  | "PARTIALLY_RECEIVED"
  | "CANCELLED";

export interface PurchaseOrder {
  id: string;
  tenantId: string;
  poNumber: string;
  supplierId: string;
  warehouseId: string;
  status: PurchaseOrderStatus;
  currency: string;
  orderDate: string;
  expectedDate: string;
  totalAmount: string;
  notes: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrderLine {
  id: string;
  tenantId: string;
  purchaseOrderId: string;
  productId: string;
  orderedQuantity: string;
  receivedQuantity: string;
  uom: string;
  unitPrice: string;
  lineTotal: string;
}

export interface GoodsReceipt {
  id: string;
  tenantId: string;
  receiptNumber: string;
  purchaseOrderId: string;
  warehouseId: string;
  receivedAt: string;
  receivedBy: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GoodsReceiptLine {
  id: string;
  tenantId: string;
  goodsReceiptId: string;
  purchaseOrderLineId: string;
  productId: string;
  quantity: string;
  uom: string;
  unitCost: string;
  supplierLotRef: string;
  productionDate: string;
  expiryDate: string;
  lotId: string;
}

export type LotStatus = "AVAILABLE" | "RESERVED" | "SOLD_OUT";
export type LotSource = "PURCHASE" | "PRODUCTION";

export interface Lot {
  id: string;
  tenantId: string;
  lotNumber: string;
  productId: string;
  warehouseId: string;
  status: LotStatus;
  initialQuantity: string;
  currentQuantity: string;
  uom: string;
  unitCost: string;
  currency: string;
  productionDate: string;
  expiryDate: string;
  receivedAt: string | null;
  source: LotSource;
  purchaseOrderLineId: string | null;
  productionOrderId: string | null;
  parentLotIds: string[];
  supplierLotRef: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export type StockMovementType =
  | "RECEIPT"
  | "PRODUCTION_INPUT"
  | "PRODUCTION_OUTPUT"
  | "SALE"
  | "ADJUSTMENT";

export type StockMovementReferenceType =
  | "PURCHASE_ORDER"
  | "PRODUCTION_ORDER"
  | "SALES_ORDER"
  | "ADJUSTMENT";

export interface StockMovement {
  id: string;
  tenantId: string;
  type: StockMovementType;
  lotId: string;
  warehouseId: string;
  quantity: string;
  uom: string;
  unitCost: string;
  totalCost: string;
  referenceType: StockMovementReferenceType;
  referenceId: string | null;
  reasonCode: string | null;
  notes: string | null;
  performedBy: string;
  performedAt: string;
  createdAt: string;
}

export interface Recipe {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  outputProductId: string;
  outputQuantity: number;
  outputUom: string;
  expectedYieldPercent: number;
  version: number;
  isActive: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RecipeIngredient {
  id: string;
  tenantId: string;
  recipeId: string;
  productId: string;
  quantity: string;
  uom: string;
  isOptional: boolean;
  notes: string | null;
}

export type ProductionOrderStatus =
  | "DRAFT"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export interface ProductionOrder {
  id: string;
  tenantId: string;
  orderNumber: string;
  recipeId: string;
  recipeVersion: number;
  warehouseId: string;
  status: ProductionOrderStatus;
  plannedOutputQuantity: string;
  plannedOutputUom: string;
  actualOutputQuantity: string | null;
  outputLotId: string | null;
  scheduledFor: string;
  startedAt: string | null;
  completedAt: string | null;
  totalInputCost: string | null;
  unitOutputCost: string | null;
  yieldPercent: string | null;
  createdBy: string;
  completedBy: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ConsumedLot {
  lotId: string;
  quantity: string;
  unitCost: string;
}

export interface ProductionOrderInput {
  id: string;
  tenantId: string;
  productionOrderId: string;
  productId: string;
  plannedQuantity: string;
  plannedUom: string;
  actualQuantity: string | null;
  consumedLots: ConsumedLot[];
  notes: string | null;
}

export type SalesOrderStatus =
  | "DRAFT"
  | "CONFIRMED"
  | "PICKED"
  | "INVOICED"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export interface SalesOrder {
  id: string;
  tenantId: string;
  orderNumber: string;
  customerId: string;
  warehouseId: string;
  status: SalesOrderStatus;
  currency: string;
  orderDate: string;
  promisedDate: string;
  subtotal: string;
  taxAmount: string;
  totalAmount: string;
  totalCogs: string | null;
  grossMargin: string | null;
  notes: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AllocatedLot {
  lotId: string;
  quantity: string;
  unitCost: string;
}

export interface SalesOrderLine {
  id: string;
  tenantId: string;
  salesOrderId: string;
  productId: string;
  orderedQuantity: string;
  uom: string;
  unitPrice: string;
  lineTotal: string;
  allocatedLots: AllocatedLot[];
}

export type InvoiceStatus = "PAID" | "UNPAID" | "PARTIAL";

export interface Invoice {
  id: string;
  tenantId: string;
  invoiceNumber: string;
  customerId: string;
  salesOrderId: string;
  status: InvoiceStatus;
  currency: string;
  issueDate: string;
  dueDate: string;
  subtotal: string;
  taxAmount: string;
  totalAmount: string;
  paidAmount: string;
  outstandingAmount: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export type PaymentMethod = "BANK_TRANSFER" | "CASH" | "CARD";

export interface Payment {
  id: string;
  tenantId: string;
  invoiceId: string;
  amount: string;
  currency: string;
  paidAt: string;
  method: PaymentMethod;
  reference: string;
  recordedBy: string;
  createdAt: string;
}

export interface MockData {
  _meta: MockMeta;
  tenant: Tenant;
  users: User[];
  warehouses: Warehouse[];
  products: Product[];
  suppliers: Supplier[];
  customers: Customer[];
  priceLists: PriceList[];
  priceListItems: PriceListItem[];
  purchaseOrders: PurchaseOrder[];
  purchaseOrderLines: PurchaseOrderLine[];
  goodsReceipts: GoodsReceipt[];
  goodsReceiptLines: GoodsReceiptLine[];
  lots: Lot[];
  stockMovements: StockMovement[];
  recipes: Recipe[];
  recipeIngredients: RecipeIngredient[];
  productionOrders: ProductionOrder[];
  productionOrderInputs: ProductionOrderInput[];
  salesOrders: SalesOrder[];
  salesOrderLines: SalesOrderLine[];
  invoices: Invoice[];
  payments: Payment[];
}

// ─── Purchase Order request/response helpers ──────────────────
export type PurchaseOrderWithLines = PurchaseOrder & {
  lines: PurchaseOrderLine[];
};
export type GoodsReceiptWithLines = GoodsReceipt & {
  lines: GoodsReceiptLine[];
};

export interface CreatePurchaseOrderLine {
  productId: string;
  orderedQuantity: string;
  uom: string;
  unitPrice: string;
}

export interface CreatePurchaseOrderPayload {
  supplierId: string;
  warehouseId: string;
  expectedDate: string;
  currency: string;
  notes?: string | null;
  status: PurchaseOrderStatus;
  lines: CreatePurchaseOrderLine[];
}

export interface ReceiveGoodsLine {
  purchaseOrderLineId: string;
  productId: string;
  quantity: string;
  uom: string;
  unitCost: string;
  supplierLotRef: string;
  productionDate: string;
  expiryDate: string;
}

export interface ReceiveGoodsPayload {
  warehouseId: string;
  notes?: string | null;
  lines: ReceiveGoodsLine[];
}
