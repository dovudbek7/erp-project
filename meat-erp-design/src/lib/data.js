// Seed data — derived from /brief/mock-data.json. Names and amounts kept faithful.
export const DATA = {
  tenant: {
    id: 't-andijan-001',
    name: 'Andijan Meat Co',
    legalName: 'Andijan Meat Processing LLC',
    defaultCurrency: 'UZS',
    timezone: 'Asia/Tashkent',
  },
  currentUser: {
    id: 'u-002',
    fullName: 'Botir Karimov',
    email: 'prod@andijan-meat.uz',
    role: 'PRODUCTION_MANAGER',
    initials: 'BK',
  },
  users: [
    { id: 'u-001', fullName: 'Akmal Yusupov',        email: 'admin@andijan-meat.uz',     role: 'ADMIN',              initials: 'AY' },
    { id: 'u-002', fullName: 'Botir Karimov',        email: 'prod@andijan-meat.uz',      role: 'PRODUCTION_MANAGER', initials: 'BK' },
    { id: 'u-003', fullName: 'Dilshod Rahimov',      email: 'warehouse@andijan-meat.uz', role: 'WAREHOUSE_OPERATOR', initials: 'DR' },
    { id: 'u-004', fullName: 'Madina Tashpulatova',  email: 'sales@andijan-meat.uz',     role: 'SALES',              initials: 'MT' },
    { id: 'u-005', fullName: 'Nodira Saidova',       email: 'accounting@andijan-meat.uz',role: 'ACCOUNTANT',         initials: 'NS' },
  ],
  warehouses: [
    { id: 'wh-001', code: 'CS-A',   name: 'Cold Storage A',         type: 'COLD_STORAGE' },
    { id: 'wh-002', code: 'PROD-1', name: 'Production Floor 1',     type: 'PRODUCTION'   },
    { id: 'wh-003', code: 'FG-A',   name: 'Finished Goods Cold A',  type: 'COLD_STORAGE' },
    { id: 'wh-004', code: 'SHIP',   name: 'Shipping Dock',          type: 'SHIPPING'     },
  ],
  products: [
    { id: 'prod-001', sku: 'BEEF-TRIM-80',   name: 'Beef Trim 80/20',     type: 'RAW_MATERIAL',  uom: 'KG', category: 'Beef',    shelfLifeDays: 7  },
    { id: 'prod-002', sku: 'BEEF-CHUCK',     name: 'Beef Chuck',          type: 'RAW_MATERIAL',  uom: 'KG', category: 'Beef',    shelfLifeDays: 7  },
    { id: 'prod-003', sku: 'BEEF-FAT',       name: 'Beef Fat Trim',       type: 'RAW_MATERIAL',  uom: 'KG', category: 'Beef',    shelfLifeDays: 7  },
    { id: 'prod-004', sku: 'PORK-SHOULDER',  name: 'Pork Shoulder',       type: 'RAW_MATERIAL',  uom: 'KG', category: 'Pork',    shelfLifeDays: 7  },
    { id: 'prod-005', sku: 'LAMB-LEG',       name: 'Lamb Leg',            type: 'RAW_MATERIAL',  uom: 'KG', category: 'Lamb',    shelfLifeDays: 5  },
    { id: 'prod-006', sku: 'SALT',           name: 'Salt',                type: 'RAW_MATERIAL',  uom: 'KG', category: 'Spices',  shelfLifeDays: 730 },
    { id: 'prod-007', sku: 'PEPPER-BLACK',   name: 'Black Pepper Ground', type: 'RAW_MATERIAL',  uom: 'KG', category: 'Spices',  shelfLifeDays: 365 },
    { id: 'prod-008', sku: 'PAPRIKA',        name: 'Paprika',             type: 'RAW_MATERIAL',  uom: 'KG', category: 'Spices',  shelfLifeDays: 365 },
    { id: 'prod-fg-1', sku: 'MINCE-80-1KG',  name: 'Beef Mince 80/20 1kg',type: 'FINISHED_GOOD', uom: 'KG', category: 'Mince',   shelfLifeDays: 7 },
    { id: 'prod-fg-2', sku: 'LULA-500',      name: 'Lula Kebab 500g',     type: 'FINISHED_GOOD', uom: 'KG', category: 'Kebab',   shelfLifeDays: 5 },
    { id: 'prod-fg-3', sku: 'SAUSAGE-PORK',  name: 'Pork Sausage 1kg',    type: 'FINISHED_GOOD', uom: 'KG', category: 'Sausage', shelfLifeDays: 7 },
  ],
  suppliers: [
    { id: 'sup-001', code: 'SX', name: 'Sultanov Xojadod LLC', email: 'orders@sultanov.uz',     paymentTermsDays: 14 },
    { id: 'sup-002', code: 'AB', name: 'Andijan Beef Farm',    email: 'info@andbeef.uz',        paymentTermsDays: 30 },
    { id: 'sup-003', code: 'TS', name: 'Tashkent Spice Co',    email: 'sales@tashkentspice.uz', paymentTermsDays: 7 },
  ],
  customers: [
    { id: 'cus-001', code: 'KZ', name: 'Korzinka Tashkent',       type: 'RETAIL',     paymentTermsDays: 14 },
    { id: 'cus-002', code: 'MK', name: 'Makro Wholesale',          type: 'WHOLESALE',  paymentTermsDays: 30 },
    { id: 'cus-003', code: 'PL', name: 'Plov Center Restaurant',   type: 'RESTAURANT', paymentTermsDays: 7  },
    { id: 'cus-004', code: 'FL', name: 'Fergana Distributors LLC', type: 'DISTRIBUTOR',paymentTermsDays: 30 },
  ],

  lots: [
    { id: 'lot-001', lotNumber: 'BEEF-TRIM-2026-05-001', productId: 'prod-001', warehouseId: 'wh-001', status: 'AVAILABLE',
      initialQuantity: '100.000', currentQuantity: '40.000', uom: 'KG', unitCost: '65000.00', currency: 'UZS',
      productionDate: '2026-05-01', expiryDate: '2026-05-10', receivedAt: '2026-05-02',
      source: 'PURCHASE', supplierLotRef: 'LOT-SX-2347', parentLotIds: [] },
    { id: 'lot-002', lotNumber: 'BEEF-CHUCK-2026-05-001', productId: 'prod-002', warehouseId: 'wh-001', status: 'AVAILABLE',
      initialQuantity: '80.000', currentQuantity: '80.000', uom: 'KG', unitCost: '58000.00', currency: 'UZS',
      productionDate: '2026-05-02', expiryDate: '2026-05-09', receivedAt: '2026-05-03',
      source: 'PURCHASE', supplierLotRef: 'LOT-AB-1129', parentLotIds: [] },
    { id: 'lot-003', lotNumber: 'BEEF-FAT-2026-05-001', productId: 'prod-003', warehouseId: 'wh-001', status: 'AVAILABLE',
      initialQuantity: '40.000', currentQuantity: '25.000', uom: 'KG', unitCost: '32000.00', currency: 'UZS',
      productionDate: '2026-05-01', expiryDate: '2026-05-08', receivedAt: '2026-05-02',
      source: 'PURCHASE', supplierLotRef: 'LOT-SX-2348', parentLotIds: [] },
    { id: 'lot-004', lotNumber: 'PORK-2026-04-022', productId: 'prod-004', warehouseId: 'wh-001', status: 'QUARANTINE',
      initialQuantity: '60.000', currentQuantity: '60.000', uom: 'KG', unitCost: '54000.00', currency: 'UZS',
      productionDate: '2026-05-03', expiryDate: '2026-05-12', receivedAt: '2026-05-04',
      source: 'PURCHASE', supplierLotRef: 'PRK-22A', parentLotIds: [] },
    { id: 'lot-005', lotNumber: 'LAMB-2026-05-001', productId: 'prod-005', warehouseId: 'wh-001', status: 'AVAILABLE',
      initialQuantity: '30.000', currentQuantity: '30.000', uom: 'KG', unitCost: '95000.00', currency: 'UZS',
      productionDate: '2026-05-04', expiryDate: '2026-05-11', receivedAt: '2026-05-05',
      source: 'PURCHASE', supplierLotRef: 'LMB-91', parentLotIds: [] },
    { id: 'lot-006', lotNumber: 'SALT-2026-Q2', productId: 'prod-006', warehouseId: 'wh-001', status: 'AVAILABLE',
      initialQuantity: '50.000', currentQuantity: '47.500', uom: 'KG', unitCost: '4000.00', currency: 'UZS',
      productionDate: '2026-04-01', expiryDate: '2028-04-01', receivedAt: '2026-04-05',
      source: 'PURCHASE', supplierLotRef: 'TS-SALT-Q2', parentLotIds: [] },
    { id: 'lot-007', lotNumber: 'BEEF-FROZEN-A', productId: 'prod-001', warehouseId: 'wh-001', status: 'EXPIRED',
      initialQuantity: '20.000', currentQuantity: '20.000', uom: 'KG', unitCost: '63000.00', currency: 'UZS',
      productionDate: '2026-04-20', expiryDate: '2026-05-04', receivedAt: '2026-04-21',
      source: 'PURCHASE', supplierLotRef: 'LOT-SX-2210', parentLotIds: [] },
    { id: 'lot-fg-001', lotNumber: 'MINCE-2026-05-001', productId: 'prod-fg-1', warehouseId: 'wh-003', status: 'AVAILABLE',
      initialQuantity: '72.000', currentQuantity: '52.000', uom: 'KG', unitCost: '67708.33', currency: 'UZS',
      productionDate: '2026-05-04', expiryDate: '2026-05-11', receivedAt: '2026-05-04',
      source: 'PRODUCTION', productionOrderId: 'po-001',
      parentLotIds: ['lot-001', 'lot-002', 'lot-003'] },
  ],

  recipes: [
    { id: 'rcp-001', code: 'RCP-MINCE-80', name: 'Beef Mince 80/20', version: 1,
      outputProductId: 'prod-fg-1', outputQuantity: '100.000', outputUom: 'KG',
      expectedYieldPercent: '96.00', isActive: true,
      ingredients: [
        { productId: 'prod-001', name: 'Beef Trim 80/20', quantity: '85.000', uom: 'KG', isOptional: false },
        { productId: 'prod-003', name: 'Beef Fat Trim',   quantity: '19.000', uom: 'KG', isOptional: false },
        { productId: 'prod-006', name: 'Salt',            quantity: '0.800',  uom: 'KG', isOptional: false },
        { productId: 'prod-007', name: 'Black Pepper',    quantity: '0.200',  uom: 'KG', isOptional: false },
      ] },
    { id: 'rcp-002', code: 'RCP-LULA', name: 'Lula Kebab', version: 1,
      outputProductId: 'prod-fg-2', outputQuantity: '50.000', outputUom: 'KG',
      expectedYieldPercent: '94.00', isActive: true,
      ingredients: [
        { productId: 'prod-002', name: 'Beef Chuck', quantity: '38.000', uom: 'KG', isOptional: false },
        { productId: 'prod-005', name: 'Lamb Leg',   quantity: '14.000', uom: 'KG', isOptional: false },
        { productId: 'prod-006', name: 'Salt',       quantity: '0.700',  uom: 'KG', isOptional: false },
        { productId: 'prod-008', name: 'Paprika',    quantity: '0.300',  uom: 'KG', isOptional: false },
      ] },
  ],

  productionOrders: [
    { id: 'po-001', orderNumber: 'PRD-2026-0001', recipeId: 'rcp-001', recipeName: 'Beef Mince 80/20',
      warehouseId: 'wh-002', status: 'COMPLETED',
      plannedOutputQuantity: '75.000', actualOutputQuantity: '72.000',
      yieldPercent: '96.00', totalInputCost: '4875000.00', unitOutputCost: '67708.33',
      scheduledFor: '2026-05-04T08:00:00+05:00', startedAt: '2026-05-04T08:15:00+05:00', completedAt: '2026-05-04T11:45:00+05:00',
      outputLotId: 'lot-fg-001', createdBy: 'Botir Karimov', completedBy: 'Botir Karimov' },
    { id: 'po-002', orderNumber: 'PRD-2026-0002', recipeId: 'rcp-001', recipeName: 'Beef Mince 80/20',
      warehouseId: 'wh-002', status: 'IN_PROGRESS',
      plannedOutputQuantity: '50.000', actualOutputQuantity: null,
      scheduledFor: '2026-05-05T08:00:00+05:00', startedAt: '2026-05-05T08:15:00+05:00',
      createdBy: 'Botir Karimov',
      inputs: [
        { product: { id: 'prod-001', sku: 'BEEF-TRIM-80',   name: 'Beef Trim 80/20' },
          plannedQuantity: '42.500', actualQuantity: '28.000',
          consumedLots: [{ lotId: 'lot-001', lotNumber: 'BEEF-TRIM-2026-05-001', quantity: '28.000', unitCost: '65000.00' }] },
        { product: { id: 'prod-003', sku: 'BEEF-FAT',       name: 'Beef Fat Trim' },
          plannedQuantity: '9.500', actualQuantity: '6.000',
          consumedLots: [{ lotId: 'lot-003', lotNumber: 'BEEF-FAT-2026-05-001', quantity: '6.000', unitCost: '32000.00' }] },
        { product: { id: 'prod-006', sku: 'SALT',           name: 'Salt' },
          plannedQuantity: '0.400', actualQuantity: null, consumedLots: [] },
        { product: { id: 'prod-007', sku: 'PEPPER-BLACK',   name: 'Black Pepper Ground' },
          plannedQuantity: '0.100', actualQuantity: null, consumedLots: [] },
      ] },
    { id: 'po-003', orderNumber: 'PRD-2026-0003', recipeId: 'rcp-002', recipeName: 'Lula Kebab',
      warehouseId: 'wh-002', status: 'DRAFT',
      plannedOutputQuantity: '80.000', actualOutputQuantity: null,
      scheduledFor: '2026-05-06T08:00:00+05:00', createdBy: 'Botir Karimov' },
  ],

  purchaseOrders: [
    { id: 'pur-001', poNumber: 'PO-2026-0008', supplier: 'Sultanov Xojadod LLC',
      status: 'PARTIALLY_RECEIVED', orderDate: '2026-04-28', expectedDate: '2026-05-02',
      totalAmount: '8000000.00', currency: 'UZS', linesCount: 2,
      lines: [
        { productId: 'prod-001', name: 'Beef Trim 80/20', orderedQty: '100.000', receivedQty: '100.000', unitPrice: '65000.00', uom: 'KG', lineTotal: '6500000.00' },
        { productId: 'prod-003', name: 'Beef Fat Trim',   orderedQty: '50.000',  receivedQty: '40.000',  unitPrice: '30000.00', uom: 'KG', lineTotal: '1500000.00' },
      ] },
    { id: 'pur-002', poNumber: 'PO-2026-0009', supplier: 'Andijan Beef Farm',
      status: 'SUBMITTED', orderDate: '2026-05-02', expectedDate: '2026-05-06',
      totalAmount: '4640000.00', currency: 'UZS', linesCount: 1,
      lines: [{ productId: 'prod-002', name: 'Beef Chuck', orderedQty: '80.000', receivedQty: '0.000', unitPrice: '58000.00', uom: 'KG', lineTotal: '4640000.00' }] },
    { id: 'pur-003', poNumber: 'PO-2026-0010', supplier: 'Tashkent Spice Co',
      status: 'RECEIVED', orderDate: '2026-04-15', expectedDate: '2026-04-18',
      totalAmount: '350000.00', currency: 'UZS', linesCount: 3 },
    { id: 'pur-004', poNumber: 'PO-2026-0011', supplier: 'Sultanov Xojadod LLC',
      status: 'DRAFT', orderDate: '2026-05-05', expectedDate: '2026-05-09',
      totalAmount: '5200000.00', currency: 'UZS', linesCount: 2 },
    { id: 'pur-005', poNumber: 'PO-2026-0007', supplier: 'Sultanov Xojadod LLC',
      status: 'CANCELLED', orderDate: '2026-04-20', expectedDate: '2026-04-25',
      totalAmount: '1200000.00', currency: 'UZS', linesCount: 1 },
  ],

  salesOrders: [
    { id: 'so-001', orderNumber: 'SO-2026-0042', customer: 'Korzinka Tashkent', customerType: 'RETAIL',
      status: 'CONFIRMED', orderDate: '2026-05-04', promisedDate: '2026-05-05',
      subtotal: '1850000.00', taxAmount: '222000.00', totalAmount: '2072000.00',
      currency: 'UZS', linesCount: 1 },
    { id: 'so-002', orderNumber: 'SO-2026-0043', customer: 'Plov Center Restaurant', customerType: 'RESTAURANT',
      status: 'DELIVERED', orderDate: '2026-05-03', promisedDate: '2026-05-04',
      subtotal: '925000.00', taxAmount: '111000.00', totalAmount: '1036000.00',
      totalCogs: '690000.00', grossMargin: '235000.00',
      currency: 'UZS', linesCount: 2 },
    { id: 'so-003', orderNumber: 'SO-2026-0044', customer: 'Makro Wholesale', customerType: 'WHOLESALE',
      status: 'DRAFT', orderDate: '2026-05-05', promisedDate: '2026-05-08',
      subtotal: '3340000.00', taxAmount: '400800.00', totalAmount: '3740800.00',
      currency: 'UZS', linesCount: 3 },
    { id: 'so-004', orderNumber: 'SO-2026-0045', customer: 'Fergana Distributors LLC', customerType: 'DISTRIBUTOR',
      status: 'PICKED', orderDate: '2026-05-04', promisedDate: '2026-05-06',
      subtotal: '5400000.00', taxAmount: '648000.00', totalAmount: '6048000.00',
      currency: 'UZS', linesCount: 4 },
  ],

  movements: [
    { id: 'mov-1', type: 'RECEIPT', quantity: '+100.000', unitCost: '65000.00', warehouse: 'CS-A',
      referenceType: 'PURCHASE_ORDER', referenceId: 'PO-2026-0008',
      performedBy: 'Dilshod Rahimov', performedAt: '2026-05-02T08:00:00+05:00',
      notes: 'Received from supplier, temp -2°C' },
    { id: 'mov-2', type: 'PRODUCTION_INPUT', quantity: '-32.000', unitCost: '65000.00', warehouse: 'CS-A',
      referenceType: 'PRODUCTION_ORDER', referenceId: 'PRD-2026-0001',
      performedBy: 'Botir Karimov', performedAt: '2026-05-04T09:30:00+05:00', notes: '' },
    { id: 'mov-3', type: 'PRODUCTION_INPUT', quantity: '-28.000', unitCost: '65000.00', warehouse: 'CS-A',
      referenceType: 'PRODUCTION_ORDER', referenceId: 'PRD-2026-0002',
      performedBy: 'Botir Karimov', performedAt: '2026-05-05T08:45:00+05:00', notes: 'Morning batch' },
  ],

  productionTrend: [
    { day: 'Apr 22', kg: 60 },  { day: 'Apr 23', kg: 92 },
    { day: 'Apr 24', kg: 80 },  { day: 'Apr 25', kg: 110 },
    { day: 'Apr 26', kg: 95 },  { day: 'Apr 27', kg: 0   },
    { day: 'Apr 28', kg: 0   }, { day: 'Apr 29', kg: 130 },
    { day: 'Apr 30', kg: 105 }, { day: 'May 01', kg: 88  },
    { day: 'May 02', kg: 145 }, { day: 'May 03', kg: 120 },
    { day: 'May 04', kg: 72  }, { day: 'May 05', kg: 28  },
  ],

  feed: [
    { type: 'expiry',     text: 'Lot BEEF-FROZEN-A expired on May 4', when: '1h ago', icon: 'alert',   tone: 'red' },
    { type: 'production', text: 'PRD-2026-0001 completed — 72.0 kg @ 96% yield', when: '4h ago', icon: 'factory', tone: 'green' },
    { type: 'sale',       text: 'SO-2026-0043 delivered to Plov Center Restaurant', when: '6h ago', icon: 'cart', tone: 'blue' },
    { type: 'receipt',    text: 'PO-2026-0008 partially received — 100kg Beef Trim 80/20', when: '1d ago', icon: 'truck', tone: 'amber' },
    { type: 'recipe',     text: 'Recipe RCP-MINCE-80 v2 published by Akmal Yusupov', when: '2d ago', icon: 'recipe', tone: 'slate' },
  ],
};

// ============================================================
// Format helpers
// ============================================================
export const fmt = {
  money(amount, currency = 'UZS') {
    if (amount === null || amount === undefined || amount === '') return '—';
    const n = parseFloat(amount);
    if (currency === 'UZS') return n.toLocaleString('en-US', { maximumFractionDigits: 0 }) + ' UZS';
    if (currency === 'USD') return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return n.toLocaleString();
  },
  qty(amount, uom) {
    if (amount === null || amount === undefined || amount === '') return '—';
    const n = parseFloat(amount);
    return n.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 }) + ' ' + (uom || '');
  },
  date(s) {
    if (!s) return '—';
    return new Date(s).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: '2-digit' });
  },
  dateTime(s) {
    if (!s) return '—';
    return new Date(s).toLocaleString('en-GB', { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  },
  daysToExpiry(expiryISO) {
    if (!expiryISO) return null;
    const today = new Date('2026-05-05');
    const exp = new Date(expiryISO);
    return Math.ceil((exp - today) / 86400000);
  },
  elapsed(startedAt) {
    if (!startedAt) return '00:00:00';
    const now = new Date('2026-05-05T11:48:00+05:00');
    const start = new Date(startedAt);
    const ms = Math.max(0, now - start);
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return [h, m, s].map(x => String(x).padStart(2, '0')).join(':');
  },
};

export const PILLS = {
  AVAILABLE:        { tone: 'green',  label: 'Available' },
  QUARANTINE:       { tone: 'blue',   label: 'Quarantine' },
  EXPIRED:          { tone: 'red',    label: 'Expired' },
  DEPLETED:         { tone: 'slate',  label: 'Depleted' },
  WRITTEN_OFF:      { tone: 'slate',  label: 'Written off' },
  DRAFT:            { tone: 'slate',  label: 'Draft' },
  IN_PROGRESS:      { tone: 'amber',  label: 'In progress' },
  COMPLETED:        { tone: 'green',  label: 'Completed' },
  CANCELLED:        { tone: 'red',    label: 'Cancelled' },
  SUBMITTED:        { tone: 'blue',   label: 'Submitted' },
  PARTIALLY_RECEIVED:{ tone: 'amber', label: 'Partial' },
  RECEIVED:         { tone: 'green',  label: 'Received' },
  CONFIRMED:        { tone: 'blue',   label: 'Confirmed' },
  PICKED:           { tone: 'purple', label: 'Picked' },
  DELIVERED:        { tone: 'green',  label: 'Delivered' },
  INVOICED:         { tone: 'green',  label: 'Invoiced' },
  RETAIL:           { tone: 'blue',   label: 'Retail' },
  WHOLESALE:        { tone: 'purple', label: 'Wholesale' },
  RESTAURANT:       { tone: 'amber',  label: 'Restaurant' },
  DISTRIBUTOR:      { tone: 'slate',  label: 'Distributor' },
  ADMIN:            { tone: 'red',    label: 'Admin' },
  PRODUCTION_MANAGER:{ tone: 'amber', label: 'Production Manager' },
  WAREHOUSE_OPERATOR:{ tone: 'blue',  label: 'Warehouse Operator' },
  SALES:            { tone: 'purple', label: 'Sales' },
  ACCOUNTANT:       { tone: 'green',  label: 'Accountant' },
  VIEWER:           { tone: 'slate',  label: 'Viewer' },
};
