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

export type UserRole = "ADMIN" | "MANAGER" | "SALES" | "WAREHOUSE";

export interface User {
  id: string;
  tenantId: string;
  email: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  tenantId: string;
  sku: string;
  name: string;
  category: string;
  baseUom: string;
  isPackaged: boolean;
  averageWeight?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  tenantId: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  creditLimit: string;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus =
  | "DRAFT"
  | "CONFIRMED"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export interface SalesOrder {
  id: string;
  tenantId: string;
  orderNumber: string;
  customerId: string;
  status: OrderStatus;
  totalAmount: string;
  orderDate: string;
  expectedDeliveryDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface SalesOrderItem {
  id: string;
  tenantId: string;
  salesOrderId: string;
  productId: string;
  orderedQuantity: string;
  uom: string;
  unitPrice: string;
  lineTotal: string;
  allocatedLots: string[];
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

export interface Lot {
  id: string;
  tenantId: string;
  lotNumber: string;
  productId: string;
  productionDate: string;
  expiryDate: string;
  initialQuantity: string;
  currentQuantity: string;
  warehouseId: string;
  unitCost: string;
  currency: string;
  source: string;
  uom: string;
  costPerUnit: string;
  status: "AVAILABLE" | "RESERVED" | "SOLD_OUT";
  createdAt: string;
}

export interface InventoryMovement {
  id: string;
  tenantId: string;
  lotId: string;
  type: "PRODUCTION" | "SALE" | "ADJUSTMENT" | "RETURN";
  quantity: string;
  referenceType: "SALES_ORDER" | "MANUAL";
  referenceId: string;
  movedAt: string;
}

export interface MockData {
  _meta: MockMeta;
  tenant: Tenant;
  users: User[];
  products: Product[];
  customers: Customer[];
  salesOrders: SalesOrder[];
  salesOrderItems: SalesOrderItem[];
  invoices: Invoice[];
  lots: Lot[];
  inventoryMovements: InventoryMovement[];
}
export interface warehouse {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  type: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
