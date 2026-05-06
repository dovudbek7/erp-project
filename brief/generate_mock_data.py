#!/usr/bin/env python3
"""
Generates mock-data.json — a coherent seed dataset for the meat ERP MVP.
One tenant, fully fleshed out: users, warehouses, products, suppliers, customers,
purchase orders + receipts (with real lots), recipes, production orders (one DRAFT,
one IN_PROGRESS, one COMPLETED with rolled-up costing and a finished-goods lot),
sales orders in various stages, invoices, payments, and a stock-movements ledger
that is internally consistent with all of the above.

Decimals are emitted as strings, never floats.
"""

import json
from decimal import Decimal, getcontext
from datetime import datetime, timezone, timedelta

getcontext().prec = 28

# Helpers
def d(s):
    return Decimal(s)

def s2(x):  # 2 decimals
    return f"{Decimal(x).quantize(Decimal('0.01'))}"

def s3(x):  # 3 decimals
    return f"{Decimal(x).quantize(Decimal('0.001'))}"

def iso(dt):
    return dt.strftime("%Y-%m-%dT%H:%M:%S+05:00")

def isodate(dt):
    return dt.strftime("%Y-%m-%d")

# Anchor "today" so the seed is reproducible
TODAY = datetime(2026, 5, 5, 8, 0, 0)
def days_ago(n, hours=0): return TODAY - timedelta(days=n) + timedelta(hours=hours)
def days_ahead(n): return TODAY + timedelta(days=n)

TENANT_ID = "t-andijan-001"

# ==== TENANT ====
tenant = {
    "id": TENANT_ID,
    "name": "Andijan Meat Co",
    "legalName": "Andijan Meat Processing LLC",
    "taxId": "300123456",
    "defaultCurrency": "UZS",
    "timezone": "Asia/Tashkent",
    "createdAt": iso(days_ago(180)),
    "updatedAt": iso(days_ago(180)),
}

# ==== USERS ====
users = [
    {"id": "u-001", "tenantId": TENANT_ID, "email": "admin@andijan-meat.uz",
     "fullName": "Akmal Yusupov",      "role": "ADMIN",
     "isActive": True, "lastLoginAt": iso(days_ago(0, 1)),
     "createdAt": iso(days_ago(180)), "updatedAt": iso(days_ago(0))},
    {"id": "u-002", "tenantId": TENANT_ID, "email": "prod@andijan-meat.uz",
     "fullName": "Botir Karimov",      "role": "PRODUCTION_MANAGER",
     "isActive": True, "lastLoginAt": iso(days_ago(0, 2)),
     "createdAt": iso(days_ago(170)), "updatedAt": iso(days_ago(0))},
    {"id": "u-003", "tenantId": TENANT_ID, "email": "warehouse@andijan-meat.uz",
     "fullName": "Dilshod Rahimov",    "role": "WAREHOUSE_OPERATOR",
     "isActive": True, "lastLoginAt": iso(days_ago(1)),
     "createdAt": iso(days_ago(160)), "updatedAt": iso(days_ago(1))},
    {"id": "u-004", "tenantId": TENANT_ID, "email": "sales@andijan-meat.uz",
     "fullName": "Madina Tashpulatova", "role": "SALES",
     "isActive": True, "lastLoginAt": iso(days_ago(0, 4)),
     "createdAt": iso(days_ago(150)), "updatedAt": iso(days_ago(0))},
    {"id": "u-005", "tenantId": TENANT_ID, "email": "accounting@andijan-meat.uz",
     "fullName": "Nodira Saidova",     "role": "ACCOUNTANT",
     "isActive": True, "lastLoginAt": iso(days_ago(2)),
     "createdAt": iso(days_ago(140)), "updatedAt": iso(days_ago(2))},
]

# ==== WAREHOUSES ====
warehouses = [
    {"id": "wh-001", "tenantId": TENANT_ID, "code": "CS-A", "name": "Cold Storage A",
     "type": "COLD_STORAGE", "isActive": True,
     "createdAt": iso(days_ago(180)), "updatedAt": iso(days_ago(180))},
    {"id": "wh-002", "tenantId": TENANT_ID, "code": "PROD-1", "name": "Production Floor 1",
     "type": "PRODUCTION", "isActive": True,
     "createdAt": iso(days_ago(180)), "updatedAt": iso(days_ago(180))},
    {"id": "wh-003", "tenantId": TENANT_ID, "code": "FG-A", "name": "Finished Goods Cold A",
     "type": "COLD_STORAGE", "isActive": True,
     "createdAt": iso(days_ago(180)), "updatedAt": iso(days_ago(180))},
    {"id": "wh-004", "tenantId": TENANT_ID, "code": "SHIP", "name": "Shipping Dock",
     "type": "SHIPPING", "isActive": True,
     "createdAt": iso(days_ago(180)), "updatedAt": iso(days_ago(180))},
]

# ==== PRODUCTS ====
products = [
    # Raw materials
    {"id": "prod-001", "sku": "BEEF-TRIM-80",  "name": "Beef Trim 80/20",
     "type": "RAW_MATERIAL", "uom": "KG", "shelfLifeDays": 5, "category": "Beef"},
    {"id": "prod-002", "sku": "BEEF-CHUCK",    "name": "Beef Chuck",
     "type": "RAW_MATERIAL", "uom": "KG", "shelfLifeDays": 5, "category": "Beef"},
    {"id": "prod-003", "sku": "BEEF-FAT",      "name": "Beef Fat Trim",
     "type": "RAW_MATERIAL", "uom": "KG", "shelfLifeDays": 5, "category": "Beef"},
    {"id": "prod-004", "sku": "PORK-SHOULDER", "name": "Pork Shoulder",
     "type": "RAW_MATERIAL", "uom": "KG", "shelfLifeDays": 5, "category": "Pork"},
    {"id": "prod-005", "sku": "LAMB-LEG",      "name": "Lamb Leg",
     "type": "RAW_MATERIAL", "uom": "KG", "shelfLifeDays": 5, "category": "Lamb"},
    {"id": "prod-006", "sku": "SALT",          "name": "Salt",
     "type": "RAW_MATERIAL", "uom": "KG", "shelfLifeDays": None, "category": "Spices"},
    {"id": "prod-007", "sku": "PEPPER-BLACK",  "name": "Black Pepper Ground",
     "type": "RAW_MATERIAL", "uom": "KG", "shelfLifeDays": 365, "category": "Spices"},
    {"id": "prod-008", "sku": "PAPRIKA",       "name": "Paprika",
     "type": "RAW_MATERIAL", "uom": "KG", "shelfLifeDays": 365, "category": "Spices"},
    {"id": "prod-009", "sku": "GARLIC-POWDER", "name": "Garlic Powder",
     "type": "RAW_MATERIAL", "uom": "KG", "shelfLifeDays": 365, "category": "Spices"},
    # Packaging
    {"id": "prod-101", "sku": "TRAY-1KG",      "name": "PE Tray 1kg",
     "type": "PACKAGING", "uom": "PIECE", "shelfLifeDays": None, "category": "Packaging"},
    {"id": "prod-102", "sku": "FILM-WRAP",     "name": "Stretch Film 500m",
     "type": "PACKAGING", "uom": "PIECE", "shelfLifeDays": None, "category": "Packaging"},
    {"id": "prod-103", "sku": "LABEL-A6",      "name": "Product Label A6",
     "type": "PACKAGING", "uom": "PIECE", "shelfLifeDays": None, "category": "Packaging"},
    # Finished goods
    {"id": "prod-201", "sku": "BEEF-MINCE-80-1KG", "name": "Beef Mince 80/20 1kg",
     "type": "FINISHED_GOOD", "uom": "KG", "shelfLifeDays": 7, "category": "Mince"},
    {"id": "prod-202", "sku": "LULA-KEBAB-500G",   "name": "Lula Kebab Mix 500g",
     "type": "FINISHED_GOOD", "uom": "KG", "shelfLifeDays": 5, "category": "Prepared"},
    {"id": "prod-203", "sku": "KUPATY-1KG",        "name": "Kupaty Sausage 1kg",
     "type": "FINISHED_GOOD", "uom": "KG", "shelfLifeDays": 6, "category": "Sausage"},
]
# Add common fields to every product
for p in products:
    p.update({
        "tenantId": TENANT_ID,
        "barcode": None,
        "isActive": True,
        "notes": None,
        "createdAt": iso(days_ago(180)),
        "updatedAt": iso(days_ago(30)),
    })

# ==== SUPPLIERS ====
suppliers = [
    {"id": "sup-001", "code": "SX",  "name": "Sultanov Xojadod LLC",
     "taxId": "301234567", "contactName": "Sultan Sultanov",
     "phone": "+998901234567", "email": "sales@sultanov.uz",
     "address": "Andijan, Mashʼal St 12", "paymentTermsDays": 14},
    {"id": "sup-002", "code": "FM",  "name": "Farg'ona Meat Supply",
     "taxId": "302345678", "contactName": "Farkhod Mirzaev",
     "phone": "+998902345678", "email": "info@fmeat.uz",
     "address": "Fergana, Industrial Zone B", "paymentTermsDays": 30},
    {"id": "sup-003", "code": "TS",  "name": "Tashkent Spice Co",
     "taxId": "303456789", "contactName": "Timur Saidov",
     "phone": "+998903456789", "email": "orders@tspice.uz",
     "address": "Tashkent, Yashnabad", "paymentTermsDays": 30},
    {"id": "sup-004", "code": "PK",  "name": "Pak Packaging",
     "taxId": "304567890", "contactName": "Polat Karimov",
     "phone": "+998904567890", "email": "hello@pakpack.uz",
     "address": "Tashkent, Sergeli", "paymentTermsDays": 21},
]
for sp in suppliers:
    sp.update({
        "tenantId": TENANT_ID, "isActive": True,
        "createdAt": iso(days_ago(170)), "updatedAt": iso(days_ago(60)),
    })

# ==== CUSTOMERS ====
customers = [
    {"id": "cus-001", "code": "KZ", "name": "Korzinka Tashkent", "type": "RETAIL",
     "taxId": "500111222", "contactName": "Procurement Desk",
     "phone": "+998711234567", "email": "buy@korzinka.uz",
     "address": "Tashkent (multiple stores)", "paymentTermsDays": 14,
     "creditLimit": "100000000.00", "priceListId": "pl-001"},
    {"id": "cus-002", "code": "MK", "name": "Makro Wholesale", "type": "WHOLESALE",
     "taxId": "500222333", "contactName": "Aziza Yusupova",
     "phone": "+998712345678", "email": "ordering@makro.uz",
     "address": "Tashkent, Sergeli", "paymentTermsDays": 30,
     "creditLimit": "200000000.00", "priceListId": "pl-002"},
    {"id": "cus-003", "code": "PL", "name": "Plov Center Restaurant", "type": "RESTAURANT",
     "taxId": "500333444", "contactName": "Akhmad Tashpulatov",
     "phone": "+998713456789", "email": "kitchen@plovcenter.uz",
     "address": "Tashkent, Beshyogoch", "paymentTermsDays": 7,
     "creditLimit": "10000000.00", "priceListId": "pl-001"},
    {"id": "cus-004", "code": "FL", "name": "Fergana Distributors LLC", "type": "DISTRIBUTOR",
     "taxId": "500444555", "contactName": "Bakhtiyor Komilov",
     "phone": "+998714567890", "email": "ops@fergana-dist.uz",
     "address": "Fergana, Mustaqillik", "paymentTermsDays": 45,
     "creditLimit": "150000000.00", "priceListId": "pl-002"},
]
for c in customers:
    c.update({
        "tenantId": TENANT_ID, "isActive": True,
        "createdAt": iso(days_ago(150)), "updatedAt": iso(days_ago(20)),
    })

# ==== PRICE LISTS ====
price_lists = [
    {"id": "pl-001", "tenantId": TENANT_ID, "name": "Retail Standard",
     "currency": "UZS", "validFrom": isodate(days_ago(60)), "validTo": None,
     "isDefault": True, "createdAt": iso(days_ago(60)), "updatedAt": iso(days_ago(60))},
    {"id": "pl-002", "tenantId": TENANT_ID, "name": "Wholesale",
     "currency": "UZS", "validFrom": isodate(days_ago(60)), "validTo": None,
     "isDefault": False, "createdAt": iso(days_ago(60)), "updatedAt": iso(days_ago(60))},
]

price_list_items = []
def add_price(plid, prod_id, price, min_qty=None, idx=[0]):
    idx[0] += 1
    price_list_items.append({
        "id": f"pli-{idx[0]:03d}", "tenantId": TENANT_ID, "priceListId": plid,
        "productId": prod_id, "unitPrice": s2(price), "minQuantity": s3(min_qty) if min_qty else None,
    })

# Retail prices (UZS per kg)
add_price("pl-001", "prod-201", 92500)
add_price("pl-001", "prod-202", 85000)
add_price("pl-001", "prod-203", 78000)
# Wholesale prices (lower)
add_price("pl-002", "prod-201", 86000)
add_price("pl-002", "prod-202", 79000)
add_price("pl-002", "prod-203", 72000)
# Wholesale tier — buy 50kg+, save more
add_price("pl-002", "prod-201", 82000, min_qty=50)

# ==== PURCHASE ORDERS, GOODS RECEIPTS, AND LOTS ====
purchase_orders = []
purchase_order_lines = []
goods_receipts = []
goods_receipt_lines = []
lots = []
stock_movements = []

mvm_idx = [0]
def post_movement(**kw):
    mvm_idx[0] += 1
    sm = {
        "id": f"sm-{mvm_idx[0]:04d}",
        "tenantId": TENANT_ID,
        **kw,
    }
    stock_movements.append(sm)
    return sm

# --- PO 1: Beef trim from SX, fully received 3 days ago ---
po1 = {
    "id": "po-001", "tenantId": TENANT_ID, "poNumber": "PO-2026-0001",
    "supplierId": "sup-001", "warehouseId": "wh-001",
    "status": "RECEIVED", "currency": "UZS",
    "orderDate": isodate(days_ago(5)),
    "expectedDate": isodate(days_ago(3)),
    "totalAmount": s2(0),  # filled below
    "notes": "Weekly beef order",
    "createdBy": "u-002",
    "createdAt": iso(days_ago(5)),
    "updatedAt": iso(days_ago(3)),
}
po1_lines = [
    {"productId": "prod-001", "ordered": 100, "received": 100, "unitPrice": 65000},
    {"productId": "prod-002", "ordered": 60,  "received": 60,  "unitPrice": 72000},
    {"productId": "prod-003", "ordered": 40,  "received": 40,  "unitPrice": 25000},
]
po1_total = Decimal(0)
for i, ln in enumerate(po1_lines, start=1):
    line = {
        "id": f"pol-001-{i}", "tenantId": TENANT_ID, "purchaseOrderId": "po-001",
        "productId": ln["productId"], "orderedQuantity": s3(ln["ordered"]),
        "receivedQuantity": s3(ln["received"]), "uom": "KG",
        "unitPrice": s2(ln["unitPrice"]),
        "lineTotal": s2(Decimal(ln["ordered"]) * Decimal(ln["unitPrice"])),
    }
    po1_total += Decimal(line["lineTotal"])
    purchase_order_lines.append(line)
po1["totalAmount"] = s2(po1_total)
purchase_orders.append(po1)

# Receipt for PO 1
gr1 = {
    "id": "gr-001", "tenantId": TENANT_ID, "receiptNumber": "GR-2026-0001",
    "purchaseOrderId": "po-001", "warehouseId": "wh-001",
    "receivedAt": iso(days_ago(3)), "receivedBy": "u-003",
    "notes": "Trucks arrived at -2°C, all in good condition",
    "createdAt": iso(days_ago(3)), "updatedAt": iso(days_ago(3)),
}
goods_receipts.append(gr1)

# Lots created from PO 1
lots_po1 = [
    # Lot from beef trim — partially consumed by completed production order
    {"lot_id": "lot-001", "lot_no": "BEEF-TRIM-2026-05-001", "prod": "prod-001",
     "init": 100, "current": 40, "cost": 65000,
     "exp_offset": 5, "supplier_ref": "LOT-SX-2347", "po_line": "pol-001-1"},
    # Lot from beef chuck — untouched
    {"lot_id": "lot-002", "lot_no": "BEEF-CHUCK-2026-05-001", "prod": "prod-002",
     "init": 60, "current": 60, "cost": 72000,
     "exp_offset": 5, "supplier_ref": "LOT-SX-2348", "po_line": "pol-001-2"},
    {"lot_id": "lot-003", "lot_no": "BEEF-FAT-2026-05-001", "prod": "prod-003",
     "init": 40, "current": 35, "cost": 25000,
     "exp_offset": 5, "supplier_ref": "LOT-SX-2349", "po_line": "pol-001-3"},
]
production_date = isodate(days_ago(4))  # supplier processed it day before delivery
for ld in lots_po1:
    lot = {
        "id": ld["lot_id"], "tenantId": TENANT_ID, "lotNumber": ld["lot_no"],
        "productId": ld["prod"], "warehouseId": "wh-001",
        "status": "AVAILABLE",
        "initialQuantity": s3(ld["init"]), "currentQuantity": s3(ld["current"]),
        "uom": "KG",
        "unitCost": s2(ld["cost"]), "currency": "UZS",
        "productionDate": production_date,
        "expiryDate": isodate(TODAY + timedelta(days=ld["exp_offset"])),
        "receivedAt": iso(days_ago(3)),
        "source": "PURCHASE",
        "purchaseOrderLineId": ld["po_line"],
        "productionOrderId": None,
        "parentLotIds": [],
        "supplierLotRef": ld["supplier_ref"],
        "notes": None,
        "createdAt": iso(days_ago(3)),
        "updatedAt": iso(days_ago(0)),
    }
    lots.append(lot)
    # Goods receipt line
    goods_receipt_lines.append({
        "id": f"grl-001-{ld['po_line'].split('-')[-1]}", "tenantId": TENANT_ID,
        "goodsReceiptId": "gr-001",
        "purchaseOrderLineId": ld["po_line"],
        "productId": ld["prod"], "quantity": s3(ld["init"]), "uom": "KG",
        "unitCost": s2(ld["cost"]),
        "supplierLotRef": ld["supplier_ref"],
        "productionDate": production_date,
        "expiryDate": isodate(TODAY + timedelta(days=ld["exp_offset"])),
        "lotId": ld["lot_id"],
    })
    # Receipt movement
    post_movement(
        type="RECEIPT", lotId=ld["lot_id"], warehouseId="wh-001",
        quantity=s3(ld["init"]), uom="KG",
        unitCost=s2(ld["cost"]), totalCost=s2(Decimal(ld["init"]) * Decimal(ld["cost"])),
        referenceType="PURCHASE_ORDER", referenceId="po-001",
        reasonCode=None, notes=None,
        performedBy="u-003", performedAt=iso(days_ago(3)),
        createdAt=iso(days_ago(3)),
    )

# --- PO 2: Spices from TS, partially received ---
po2 = {
    "id": "po-002", "tenantId": TENANT_ID, "poNumber": "PO-2026-0002",
    "supplierId": "sup-003", "warehouseId": "wh-001",
    "status": "PARTIALLY_RECEIVED", "currency": "UZS",
    "orderDate": isodate(days_ago(7)),
    "expectedDate": isodate(days_ago(2)),
    "totalAmount": s2(0),
    "notes": "Quarterly spice replenishment",
    "createdBy": "u-002",
    "createdAt": iso(days_ago(7)), "updatedAt": iso(days_ago(2)),
}
po2_lines = [
    {"productId": "prod-006", "ordered": 50, "received": 50, "unitPrice": 8000},   # salt
    {"productId": "prod-007", "ordered": 10, "received": 10, "unitPrice": 95000},  # pepper
    {"productId": "prod-008", "ordered": 8,  "received": 0,  "unitPrice": 70000},  # paprika — pending
    {"productId": "prod-009", "ordered": 5,  "received": 5,  "unitPrice": 110000}, # garlic
]
po2_total = Decimal(0)
for i, ln in enumerate(po2_lines, start=1):
    line = {
        "id": f"pol-002-{i}", "tenantId": TENANT_ID, "purchaseOrderId": "po-002",
        "productId": ln["productId"], "orderedQuantity": s3(ln["ordered"]),
        "receivedQuantity": s3(ln["received"]), "uom": "KG",
        "unitPrice": s2(ln["unitPrice"]),
        "lineTotal": s2(Decimal(ln["ordered"]) * Decimal(ln["unitPrice"])),
    }
    po2_total += Decimal(line["lineTotal"])
    purchase_order_lines.append(line)
po2["totalAmount"] = s2(po2_total)
purchase_orders.append(po2)

# Receipt for PO 2 (only the 3 received items)
gr2 = {
    "id": "gr-002", "tenantId": TENANT_ID, "receiptNumber": "GR-2026-0002",
    "purchaseOrderId": "po-002", "warehouseId": "wh-001",
    "receivedAt": iso(days_ago(2)), "receivedBy": "u-003",
    "notes": "Paprika out of stock, will deliver next week",
    "createdAt": iso(days_ago(2)), "updatedAt": iso(days_ago(2)),
}
goods_receipts.append(gr2)

spice_lots = [
    {"lot_id": "lot-101", "lot_no": "SALT-2026-001", "prod": "prod-006",
     "init": 50, "current": 49.4, "cost": 8000, "exp_offset": 365, "po_line": "pol-002-1",
     "supplier_ref": "TS-SLT-118"},
    {"lot_id": "lot-102", "lot_no": "PEPPER-2026-001", "prod": "prod-007",
     "init": 10, "current": 10, "cost": 95000, "exp_offset": 300, "po_line": "pol-002-2",
     "supplier_ref": "TS-PEP-204"},
    {"lot_id": "lot-103", "lot_no": "GARLIC-2026-001", "prod": "prod-009",
     "init": 5, "current": 5, "cost": 110000, "exp_offset": 250, "po_line": "pol-002-4",
     "supplier_ref": "TS-GAR-051"},
]
for ld in spice_lots:
    lots.append({
        "id": ld["lot_id"], "tenantId": TENANT_ID, "lotNumber": ld["lot_no"],
        "productId": ld["prod"], "warehouseId": "wh-001",
        "status": "AVAILABLE",
        "initialQuantity": s3(ld["init"]), "currentQuantity": s3(ld["current"]),
        "uom": "KG",
        "unitCost": s2(ld["cost"]), "currency": "UZS",
        "productionDate": isodate(days_ago(30)),
        "expiryDate": isodate(TODAY + timedelta(days=ld["exp_offset"])),
        "receivedAt": iso(days_ago(2)),
        "source": "PURCHASE",
        "purchaseOrderLineId": ld["po_line"],
        "productionOrderId": None,
        "parentLotIds": [],
        "supplierLotRef": ld["supplier_ref"],
        "notes": None,
        "createdAt": iso(days_ago(2)),
        "updatedAt": iso(days_ago(0)),
    })
    goods_receipt_lines.append({
        "id": f"grl-002-{ld['po_line'].split('-')[-1]}", "tenantId": TENANT_ID,
        "goodsReceiptId": "gr-002", "purchaseOrderLineId": ld["po_line"],
        "productId": ld["prod"], "quantity": s3(ld["init"]), "uom": "KG",
        "unitCost": s2(ld["cost"]),
        "supplierLotRef": ld["supplier_ref"],
        "productionDate": isodate(days_ago(30)),
        "expiryDate": isodate(TODAY + timedelta(days=ld["exp_offset"])),
        "lotId": ld["lot_id"],
    })
    post_movement(
        type="RECEIPT", lotId=ld["lot_id"], warehouseId="wh-001",
        quantity=s3(ld["init"]), uom="KG",
        unitCost=s2(ld["cost"]), totalCost=s2(Decimal(ld["init"]) * Decimal(ld["cost"])),
        referenceType="PURCHASE_ORDER", referenceId="po-002",
        reasonCode=None, notes=None,
        performedBy="u-003", performedAt=iso(days_ago(2)),
        createdAt=iso(days_ago(2)),
    )

# --- PO 3: Packaging from PK, fully received last week ---
po3 = {
    "id": "po-003", "tenantId": TENANT_ID, "poNumber": "PO-2026-0003",
    "supplierId": "sup-004", "warehouseId": "wh-001",
    "status": "RECEIVED", "currency": "UZS",
    "orderDate": isodate(days_ago(10)),
    "expectedDate": isodate(days_ago(7)),
    "totalAmount": s2(0),
    "notes": None,
    "createdBy": "u-002",
    "createdAt": iso(days_ago(10)), "updatedAt": iso(days_ago(7)),
}
po3_lines = [
    {"productId": "prod-101", "ordered": 5000, "received": 5000, "unitPrice": 850, "uom": "PIECE"},
    {"productId": "prod-102", "ordered": 20,   "received": 20,   "unitPrice": 45000, "uom": "PIECE"},
    {"productId": "prod-103", "ordered": 5000, "received": 5000, "unitPrice": 120, "uom": "PIECE"},
]
po3_total = Decimal(0)
for i, ln in enumerate(po3_lines, start=1):
    line = {
        "id": f"pol-003-{i}", "tenantId": TENANT_ID, "purchaseOrderId": "po-003",
        "productId": ln["productId"], "orderedQuantity": s3(ln["ordered"]),
        "receivedQuantity": s3(ln["received"]), "uom": ln["uom"],
        "unitPrice": s2(ln["unitPrice"]),
        "lineTotal": s2(Decimal(ln["ordered"]) * Decimal(ln["unitPrice"])),
    }
    po3_total += Decimal(line["lineTotal"])
    purchase_order_lines.append(line)
po3["totalAmount"] = s2(po3_total)
purchase_orders.append(po3)

# (Skipping detailed receipt for packaging to keep file focused)
# --- PO 4: DRAFT — not yet submitted ---
po4 = {
    "id": "po-004", "tenantId": TENANT_ID, "poNumber": "PO-2026-0004",
    "supplierId": "sup-002", "warehouseId": "wh-001",
    "status": "DRAFT", "currency": "UZS",
    "orderDate": isodate(days_ago(0)),
    "expectedDate": isodate(days_ahead(3)),
    "totalAmount": s2(0),
    "notes": "Draft for next week's lamb order",
    "createdBy": "u-002",
    "createdAt": iso(days_ago(0, 2)), "updatedAt": iso(days_ago(0, 1)),
}
po4_lines = [
    {"productId": "prod-005", "ordered": 50, "received": 0, "unitPrice": 110000},
]
po4_total = Decimal(0)
for i, ln in enumerate(po4_lines, start=1):
    line = {
        "id": f"pol-004-{i}", "tenantId": TENANT_ID, "purchaseOrderId": "po-004",
        "productId": ln["productId"], "orderedQuantity": s3(ln["ordered"]),
        "receivedQuantity": s3(0), "uom": "KG",
        "unitPrice": s2(ln["unitPrice"]),
        "lineTotal": s2(Decimal(ln["ordered"]) * Decimal(ln["unitPrice"])),
    }
    po4_total += Decimal(line["lineTotal"])
    purchase_order_lines.append(line)
po4["totalAmount"] = s2(po4_total)
purchase_orders.append(po4)

# ==== RECIPES ====
recipes = [
    {"id": "rcp-001", "code": "RCP-MINCE-80", "name": "Beef Mince 80/20",
     "outputProductId": "prod-201", "outputQuantity": 100, "outputUom": "KG",
     "expectedYieldPercent": 96, "version": 1, "isActive": True,
     "ingredients": [
         {"productId": "prod-001", "quantity": 80, "uom": "KG"},   # 80% lean
         {"productId": "prod-003", "quantity": 24, "uom": "KG"},   # 20% fat (~24kg before yield loss)
         {"productId": "prod-006", "quantity": 0.8, "uom": "KG"},  # salt
     ],
     "notes": "Standard 80/20 ratio with light seasoning"},
    {"id": "rcp-002", "code": "RCP-LULA", "name": "Lula Kebab Mix",
     "outputProductId": "prod-202", "outputQuantity": 100, "outputUom": "KG",
     "expectedYieldPercent": 92, "version": 1, "isActive": True,
     "ingredients": [
         {"productId": "prod-005", "quantity": 70, "uom": "KG"},
         {"productId": "prod-003", "quantity": 35, "uom": "KG"},
         {"productId": "prod-006", "quantity": 1.2, "uom": "KG"},
         {"productId": "prod-007", "quantity": 0.4, "uom": "KG"},
         {"productId": "prod-009", "quantity": 0.6, "uom": "KG"},
     ],
     "notes": "Traditional Uzbek lula kebab seasoning"},
    {"id": "rcp-003", "code": "RCP-KUPATY", "name": "Kupaty Sausage",
     "outputProductId": "prod-203", "outputQuantity": 100, "outputUom": "KG",
     "expectedYieldPercent": 94, "version": 1, "isActive": True,
     "ingredients": [
         {"productId": "prod-002", "quantity": 60, "uom": "KG"},
         {"productId": "prod-004", "quantity": 40, "uom": "KG"},
         {"productId": "prod-006", "quantity": 1.5, "uom": "KG"},
         {"productId": "prod-007", "quantity": 0.3, "uom": "KG"},
         {"productId": "prod-008", "quantity": 0.5, "uom": "KG"},
         {"productId": "prod-009", "quantity": 0.4, "uom": "KG"},
     ],
     "notes": "Beef-pork blend Georgian-style sausage"},
]
for r in recipes:
    r.update({
        "tenantId": TENANT_ID,
        "createdAt": iso(days_ago(120)),
        "updatedAt": iso(days_ago(60)),
    })

recipe_ingredients = []
ing_idx = [0]
for r in recipes:
    for ing in r["ingredients"]:
        ing_idx[0] += 1
        recipe_ingredients.append({
            "id": f"ing-{ing_idx[0]:03d}",
            "tenantId": TENANT_ID,
            "recipeId": r["id"],
            "productId": ing["productId"],
            "quantity": s3(ing["quantity"]),
            "uom": ing["uom"],
            "isOptional": False,
            "notes": None,
        })
    del r["ingredients"]  # keep recipes flat now that ingredients are extracted

# ==== PRODUCTION ORDERS ====
production_orders = []
production_order_inputs = []

# --- PRD-1: COMPLETED 2 days ago. Mince 80/20 from beef trim + fat. Yield = 96.5% ---
prd1_id = "prd-001"
prd1_started = days_ago(2) - timedelta(hours=3)   # 3 days ago at ~05:00 — early morning shift start
prd1_completed = days_ago(2)                       # finished at 08:00 same day

# Inputs actually consumed: 60kg beef trim from lot-001, 18kg beef fat from lot-003,
# 0.6kg salt from lot-101. Roughly aligned with recipe scaled to 75kg planned output.
# Actual output: 75.0kg (yield = 75 / (60+18+0.6) ≈ 95.4%). Tweaked numbers below.
prd1_planned_output = Decimal("75.000")
prd1_actual_output = Decimal("75.000")
# Recipe ingredient amounts scale by planned/recipeBase = 75/100 = 0.75
# So planned: 80*0.75=60 beef trim, 24*0.75=18 fat, 0.8*0.75=0.6 salt
prd1_consumed = [
    {"input_id": "poi-001-1", "product": "prod-001", "planned": "60.000", "actual": "60.000",
     "lots": [("lot-001", "60.000", "65000.00")]},
    {"input_id": "poi-001-2", "product": "prod-003", "planned": "18.000", "actual": "18.000",
     "lots": [("lot-003", "5.000", "25000.00")]},  # only had small initial stock; scenario covered partially
    {"input_id": "poi-001-3", "product": "prod-006", "planned": "0.600", "actual": "0.600",
     "lots": [("lot-101", "0.600", "8000.00")]},
]
# Recompute lot-003 to give us a cleaner scenario: assume earlier "old" lot supplied the 18kg.
# To keep it simple in this seed, let's take all 18kg from lot-003 and adjust its current to 22.
# Actually we already set lot-003 currentQuantity = 35 (so initial 40 - 5 consumed). Update:
# If we say production consumed 5kg fat from lot-003, planned was 18 but actual was 5 — yield breaks.
# Let's keep numbers honest: actual fat consumed = 5kg, actualOutput recalc:
# Total input mass = 60 + 5 + 0.6 = 65.6kg; reasonable output ≈ 63kg (96% yield).
# Re-derive:
prd1_consumed = [
    {"input_id": "poi-001-1", "product": "prod-001", "planned": "60.000", "actual": "60.000",
     "lots": [("lot-001", "60.000", "65000.00")]},
    {"input_id": "poi-001-2", "product": "prod-003", "planned": "18.000", "actual": "5.000",
     "lots": [("lot-003", "5.000", "25000.00")],
     "note": "Short on fat, batch ran lean; informed production mgr"},
    {"input_id": "poi-001-3", "product": "prod-006", "planned": "0.600", "actual": "0.600",
     "lots": [("lot-101", "0.600", "8000.00")]},
]
prd1_planned_output = Decimal("75.000")
prd1_actual_output = Decimal("63.000")  # consistent with 65.6kg input ≈ 96% yield

# Total input cost = sum(qty * unitCost across consumed lots)
total_cost = Decimal(0)
for inp in prd1_consumed:
    for (lid, qty, uc) in inp["lots"]:
        total_cost += Decimal(qty) * Decimal(uc)
unit_output_cost = total_cost / prd1_actual_output
total_input_mass = sum(Decimal(inp["actual"]) for inp in prd1_consumed if inp["product"] in ("prod-001", "prod-003", "prod-005", "prod-002", "prod-004"))
yield_pct = (prd1_actual_output / total_input_mass * Decimal(100)).quantize(Decimal("0.01"))

# Output lot
fg_lot_1 = {
    "id": "lot-fg-001", "tenantId": TENANT_ID, "lotNumber": "MINCE-2026-05-001",
    "productId": "prod-201", "warehouseId": "wh-003",
    "status": "AVAILABLE",
    "initialQuantity": s3(prd1_actual_output),
    "currentQuantity": s3(prd1_actual_output - Decimal("20.000")),  # 20kg already sold
    "uom": "KG",
    "unitCost": s2(unit_output_cost),
    "currency": "UZS",
    "productionDate": isodate(prd1_completed),
    "expiryDate": isodate(prd1_completed + timedelta(days=7)),
    "receivedAt": None,
    "source": "PRODUCTION",
    "purchaseOrderLineId": None,
    "productionOrderId": prd1_id,
    "parentLotIds": ["lot-001", "lot-003", "lot-101"],
    "supplierLotRef": None,
    "notes": "Slightly low fat ratio due to stock shortage",
    "createdAt": iso(prd1_completed),
    "updatedAt": iso(days_ago(0)),
}
lots.append(fg_lot_1)

prd1 = {
    "id": prd1_id, "tenantId": TENANT_ID, "orderNumber": "PRD-2026-0001",
    "recipeId": "rcp-001", "recipeVersion": 1,
    "warehouseId": "wh-002",
    "status": "COMPLETED",
    "plannedOutputQuantity": s3(prd1_planned_output), "plannedOutputUom": "KG",
    "actualOutputQuantity": s3(prd1_actual_output),
    "outputLotId": "lot-fg-001",
    "scheduledFor": iso(prd1_started - timedelta(minutes=15)),
    "startedAt": iso(prd1_started),
    "completedAt": iso(prd1_completed),
    "totalInputCost": s2(total_cost),
    "unitOutputCost": s2(unit_output_cost),
    "yieldPercent": str(yield_pct),
    "createdBy": "u-002",
    "completedBy": "u-002",
    "notes": "Tuesday morning batch — fat shortage flagged",
    "createdAt": iso(days_ago(3)),
    "updatedAt": iso(prd1_completed),
}
production_orders.append(prd1)

# Inputs and movements for PRD-1
poi_idx = [0]
for inp in prd1_consumed:
    poi_idx[0] += 1
    consumed_lots_payload = []
    for (lid, qty, uc) in inp["lots"]:
        consumed_lots_payload.append({"lotId": lid, "quantity": s3(qty), "unitCost": s2(uc)})
        # Post production-input movement (negative)
        post_movement(
            type="PRODUCTION_INPUT", lotId=lid, warehouseId="wh-001",
            quantity=s3(-Decimal(qty)), uom="KG",
            unitCost=s2(uc),
            totalCost=s2(Decimal(qty) * Decimal(uc)),
            referenceType="PRODUCTION_ORDER", referenceId=prd1_id,
            reasonCode=None, notes=None,
            performedBy="u-002", performedAt=iso(prd1_completed),
            createdAt=iso(prd1_completed),
        )
    production_order_inputs.append({
        "id": f"poi-{poi_idx[0]:03d}",
        "tenantId": TENANT_ID,
        "productionOrderId": prd1_id,
        "productId": inp["product"],
        "plannedQuantity": s3(inp["planned"]), "plannedUom": "KG",
        "actualQuantity": s3(inp["actual"]),
        "consumedLots": consumed_lots_payload,
        "notes": inp.get("note"),
    })

# Production output movement
post_movement(
    type="PRODUCTION_OUTPUT", lotId="lot-fg-001", warehouseId="wh-003",
    quantity=s3(prd1_actual_output), uom="KG",
    unitCost=s2(unit_output_cost),
    totalCost=s2(prd1_actual_output * unit_output_cost),
    referenceType="PRODUCTION_ORDER", referenceId=prd1_id,
    reasonCode=None, notes=None,
    performedBy="u-002", performedAt=iso(prd1_completed),
    createdAt=iso(prd1_completed),
)

# --- PRD-2: IN_PROGRESS — Lula kebab. Started this morning. Some inputs recorded. ---
prd2_id = "prd-002"
prd2_started = days_ago(0, 1)  # this morning, an hour ago
prd2_planned_output = Decimal("50.000")

# Recipe scale = 50/100 = 0.5
# Planned: lamb 35, fat 17.5, salt 0.6, pepper 0.2, garlic 0.3
# Operator has weighed lamb and fat so far
# But — we don't have a lamb lot in our seed (PO-004 is DRAFT). Let's pretend lamb came in earlier.

# Add a lamb lot for completeness
lots.append({
    "id": "lot-201", "tenantId": TENANT_ID, "lotNumber": "LAMB-2026-04-001",
    "productId": "prod-005", "warehouseId": "wh-001",
    "status": "AVAILABLE",
    "initialQuantity": "40.000", "currentQuantity": "40.000",
    "uom": "KG", "unitCost": "108000.00", "currency": "UZS",
    "productionDate": isodate(days_ago(2)),
    "expiryDate": isodate(days_ahead(3)),
    "receivedAt": iso(days_ago(2, 5)),
    "source": "PURCHASE",
    "purchaseOrderLineId": None,  # historical, before our PO data starts
    "productionOrderId": None,
    "parentLotIds": [],
    "supplierLotRef": "FM-LMB-988",
    "notes": "Friday delivery from Fergana",
    "createdAt": iso(days_ago(2, 5)), "updatedAt": iso(days_ago(0)),
})
post_movement(
    type="RECEIPT", lotId="lot-201", warehouseId="wh-001",
    quantity="40.000", uom="KG",
    unitCost="108000.00", totalCost="4320000.00",
    referenceType="ADJUSTMENT", referenceId=None,
    reasonCode="HISTORICAL_OPENING", notes="Pre-system stock",
    performedBy="u-001", performedAt=iso(days_ago(2, 5)),
    createdAt=iso(days_ago(2, 5)),
)

prd2 = {
    "id": prd2_id, "tenantId": TENANT_ID, "orderNumber": "PRD-2026-0002",
    "recipeId": "rcp-002", "recipeVersion": 1,
    "warehouseId": "wh-002",
    "status": "IN_PROGRESS",
    "plannedOutputQuantity": s3(prd2_planned_output), "plannedOutputUom": "KG",
    "actualOutputQuantity": None, "outputLotId": None,
    "scheduledFor": iso(prd2_started - timedelta(minutes=30)),
    "startedAt": iso(prd2_started),
    "completedAt": None,
    "totalInputCost": None, "unitOutputCost": None, "yieldPercent": None,
    "createdBy": "u-002", "completedBy": None,
    "notes": "Lula kebab batch for restaurant orders",
    "createdAt": iso(days_ago(0, 3)),
    "updatedAt": iso(days_ago(0, 0.5)),
}
production_orders.append(prd2)

prd2_inputs = [
    # lamb: planned 35, actual 35, all from lot-201
    {"poi": "poi-101", "product": "prod-005", "planned": "35.000", "actual": "35.000",
     "lots": [{"lotId": "lot-201", "quantity": "35.000", "unitCost": "108000.00"}]},
    # beef fat: planned 17.5, actual 17.5, from lot-003 (which has 35 available... wait, lot-003 was consumed by PRD-001 too, currently 35kg)
    # Let's keep it consistent: lot-003 already consumed 5kg by prd-001. If prd-002 takes 17.5kg, that's 22.5 < 40. OK.
    # But in our seed we set lot-003.currentQuantity = 35 reflecting only PRD-001's 5kg consumption.
    # For PRD-002 (IN_PROGRESS), no movements posted yet (rule 5.5: stock movements happen on completion).
    # So lot-003's current quantity stays at 35 even though operator has "recorded" actuals.
    {"poi": "poi-102", "product": "prod-003", "planned": "17.500", "actual": "17.500",
     "lots": [{"lotId": "lot-003", "quantity": "17.500", "unitCost": "25000.00"}]},
    # salt: planned 0.6, NOT YET WEIGHED
    {"poi": "poi-103", "product": "prod-006", "planned": "0.600", "actual": None, "lots": []},
    # pepper: planned 0.2, NOT YET WEIGHED
    {"poi": "poi-104", "product": "prod-007", "planned": "0.200", "actual": None, "lots": []},
    # garlic: planned 0.3, NOT YET WEIGHED
    {"poi": "poi-105", "product": "prod-009", "planned": "0.300", "actual": None, "lots": []},
]
for inp in prd2_inputs:
    production_order_inputs.append({
        "id": inp["poi"], "tenantId": TENANT_ID, "productionOrderId": prd2_id,
        "productId": inp["product"],
        "plannedQuantity": s3(inp["planned"]), "plannedUom": "KG",
        "actualQuantity": s3(inp["actual"]) if inp["actual"] is not None else None,
        "consumedLots": inp["lots"],
        "notes": None,
    })

# --- PRD-3: DRAFT — kupaty, scheduled for tomorrow. No inputs weighed, no movements. ---
prd3_id = "prd-003"
prd3 = {
    "id": prd3_id, "tenantId": TENANT_ID, "orderNumber": "PRD-2026-0003",
    "recipeId": "rcp-003", "recipeVersion": 1,
    "warehouseId": "wh-002",
    "status": "DRAFT",
    "plannedOutputQuantity": "80.000", "plannedOutputUom": "KG",
    "actualOutputQuantity": None, "outputLotId": None,
    "scheduledFor": iso(days_ahead(1)),
    "startedAt": None, "completedAt": None,
    "totalInputCost": None, "unitOutputCost": None, "yieldPercent": None,
    "createdBy": "u-002", "completedBy": None,
    "notes": "Tomorrow morning",
    "createdAt": iso(days_ago(0, 1)),
    "updatedAt": iso(days_ago(0, 1)),
}
production_orders.append(prd3)

# Recipe scale = 80/100 = 0.8
prd3_planned = [
    ("poi-201", "prod-002", "48.000"),  # beef chuck
    ("poi-202", "prod-004", "32.000"),  # pork shoulder (no lot — operator will need to receive first!)
    ("poi-203", "prod-006", "1.200"),
    ("poi-204", "prod-007", "0.240"),
    ("poi-205", "prod-008", "0.400"),   # paprika — no lot in stock (PO-002 had it on backorder)
    ("poi-206", "prod-009", "0.320"),
]
for (pid, prod, planned) in prd3_planned:
    production_order_inputs.append({
        "id": pid, "tenantId": TENANT_ID, "productionOrderId": prd3_id,
        "productId": prod,
        "plannedQuantity": planned, "plannedUom": "KG",
        "actualQuantity": None,
        "consumedLots": [],
        "notes": None,
    })

# ==== SALES ORDERS ====
sales_orders = []
sales_order_lines = []
invoices = []
payments = []

# --- SO-1: DELIVERED yesterday. 20kg mince to Korzinka. Already invoiced + paid. ---
so1_id = "so-001"
so1_delivered = days_ago(1)
so1 = {
    "id": so1_id, "tenantId": TENANT_ID, "orderNumber": "SO-2026-0042",
    "customerId": "cus-001", "warehouseId": "wh-003",
    "status": "INVOICED", "currency": "UZS",
    "orderDate": isodate(days_ago(2)),
    "promisedDate": isodate(days_ago(1)),
    "subtotal": "1850000.00", "taxAmount": "222000.00", "totalAmount": "2072000.00",
    "totalCogs": s2(Decimal("20.000") * Decimal(fg_lot_1["unitCost"])),
    "grossMargin": s2(Decimal("1850000.00") - Decimal("20.000") * Decimal(fg_lot_1["unitCost"])),
    "notes": None, "createdBy": "u-004",
    "createdAt": iso(days_ago(2)),
    "updatedAt": iso(so1_delivered),
}
sales_orders.append(so1)
sales_order_lines.append({
    "id": "sol-001-1", "tenantId": TENANT_ID, "salesOrderId": so1_id,
    "productId": "prod-201",
    "orderedQuantity": "20.000", "uom": "KG",
    "unitPrice": "92500.00", "lineTotal": "1850000.00",
    "allocatedLots": [{"lotId": "lot-fg-001", "quantity": "20.000", "unitCost": fg_lot_1["unitCost"]}],
})
# SALE movement
post_movement(
    type="SALE", lotId="lot-fg-001", warehouseId="wh-003",
    quantity="-20.000", uom="KG",
    unitCost=fg_lot_1["unitCost"],
    totalCost=s2(Decimal("20.000") * Decimal(fg_lot_1["unitCost"])),
    referenceType="SALES_ORDER", referenceId=so1_id,
    reasonCode=None, notes=None,
    performedBy="u-003", performedAt=iso(so1_delivered),
    createdAt=iso(so1_delivered),
)
# Invoice + payment
invoices.append({
    "id": "inv-001", "tenantId": TENANT_ID, "invoiceNumber": "INV-2026-0042",
    "customerId": "cus-001", "salesOrderId": so1_id,
    "status": "PAID", "currency": "UZS",
    "issueDate": isodate(so1_delivered),
    "dueDate": isodate(so1_delivered + timedelta(days=14)),
    "subtotal": "1850000.00", "taxAmount": "222000.00",
    "totalAmount": "2072000.00", "paidAmount": "2072000.00", "outstandingAmount": "0.00",
    "notes": None,
    "createdAt": iso(so1_delivered),
    "updatedAt": iso(days_ago(0, 4)),
})
payments.append({
    "id": "pay-001", "tenantId": TENANT_ID, "invoiceId": "inv-001",
    "amount": "2072000.00", "currency": "UZS",
    "paidAt": iso(days_ago(0, 4)), "method": "BANK_TRANSFER",
    "reference": "REF-KZ-885", "recordedBy": "u-005",
    "createdAt": iso(days_ago(0, 4)),
})

# --- SO-2: CONFIRMED today, allocated, not yet picked. 15kg mince to Plov Center. ---
so2_id = "so-002"
so2 = {
    "id": so2_id, "tenantId": TENANT_ID, "orderNumber": "SO-2026-0043",
    "customerId": "cus-003", "warehouseId": "wh-003",
    "status": "CONFIRMED", "currency": "UZS",
    "orderDate": isodate(days_ago(0)),
    "promisedDate": isodate(days_ahead(1)),
    "subtotal": "1387500.00", "taxAmount": "166500.00", "totalAmount": "1554000.00",
    "totalCogs": None, "grossMargin": None,
    "notes": "Friday delivery", "createdBy": "u-004",
    "createdAt": iso(days_ago(0, 5)),
    "updatedAt": iso(days_ago(0, 4)),
}
sales_orders.append(so2)
sales_order_lines.append({
    "id": "sol-002-1", "tenantId": TENANT_ID, "salesOrderId": so2_id,
    "productId": "prod-201",
    "orderedQuantity": "15.000", "uom": "KG",
    "unitPrice": "92500.00", "lineTotal": "1387500.00",
    "allocatedLots": [{"lotId": "lot-fg-001", "quantity": "15.000", "unitCost": fg_lot_1["unitCost"]}],
})
# No SALE movement yet — only on DELIVERED.

# --- SO-3: DRAFT, not yet confirmed. 50kg mince + 30kg lula to Makro Wholesale. ---
so3_id = "so-003"
so3 = {
    "id": so3_id, "tenantId": TENANT_ID, "orderNumber": "SO-2026-0044",
    "customerId": "cus-002", "warehouseId": "wh-003",
    "status": "DRAFT", "currency": "UZS",
    "orderDate": isodate(days_ago(0)),
    "promisedDate": isodate(days_ahead(2)),
    "subtotal": "6470000.00", "taxAmount": "776400.00", "totalAmount": "7246400.00",
    "totalCogs": None, "grossMargin": None,
    "notes": "Wholesale tier pricing applied", "createdBy": "u-004",
    "createdAt": iso(days_ago(0, 1)),
    "updatedAt": iso(days_ago(0, 0.5)),
}
sales_orders.append(so3)
sales_order_lines.append({
    "id": "sol-003-1", "tenantId": TENANT_ID, "salesOrderId": so3_id,
    "productId": "prod-201",
    "orderedQuantity": "50.000", "uom": "KG",
    "unitPrice": "82000.00", "lineTotal": "4100000.00",
    "allocatedLots": [],
})
sales_order_lines.append({
    "id": "sol-003-2", "tenantId": TENANT_ID, "salesOrderId": so3_id,
    "productId": "prod-202",
    "orderedQuantity": "30.000", "uom": "KG",
    "unitPrice": "79000.00", "lineTotal": "2370000.00",
    "allocatedLots": [],
})

# --- Invoice for SO-2 doesn't exist yet (still CONFIRMED). Skipping. ---

# ==== ASSEMBLE FINAL ====
output = {
    "_meta": {
        "generatedFor": "Meat Processing ERP — Mentee MVP",
        "anchorDate": iso(TODAY),
        "currency": "UZS",
        "notes": "All quantities/cents are strings (decimal-safe). Movements are append-only. Lot.currentQuantity reflects sum of movements."
    },
    "tenant": tenant,
    "users": users,
    "warehouses": warehouses,
    "products": products,
    "suppliers": suppliers,
    "customers": customers,
    "priceLists": price_lists,
    "priceListItems": price_list_items,
    "purchaseOrders": purchase_orders,
    "purchaseOrderLines": purchase_order_lines,
    "goodsReceipts": goods_receipts,
    "goodsReceiptLines": goods_receipt_lines,
    "lots": lots,
    "stockMovements": stock_movements,
    "recipes": recipes,
    "recipeIngredients": recipe_ingredients,
    "productionOrders": production_orders,
    "productionOrderInputs": production_order_inputs,
    "salesOrders": sales_orders,
    "salesOrderLines": sales_order_lines,
    "invoices": invoices,
    "payments": payments,
}

# Sanity check: every lot's currentQuantity should equal initialQuantity + sum of movements
print("Sanity check: lot quantities")
errors = []
for lot in lots:
    moves = [m for m in stock_movements if m["lotId"] == lot["id"]]
    delta = sum(Decimal(m["quantity"]) for m in moves)
    expected = Decimal(lot["initialQuantity"]) + delta - Decimal(lot["initialQuantity"])
    # The above is goofy. Movements include the receipt itself, so:
    # currentQuantity should equal sum of all movements (since receipt is +initial)
    movement_sum = sum(Decimal(m["quantity"]) for m in moves)
    current = Decimal(lot["currentQuantity"])
    if abs(movement_sum - current) > Decimal("0.001"):
        errors.append(f"  Lot {lot['lotNumber']}: movements sum to {movement_sum}, currentQuantity is {current}")
if errors:
    for e in errors:
        print(e)
    print(f"  {len(errors)} mismatches — review before shipping")
else:
    print("  All lot quantities reconcile against movements ✓")

with open("/home/claude/meat-erp/mock-data.json", "w", encoding="utf-8") as f:
    json.dump(output, f, indent=2, ensure_ascii=False)

# Summary
print("\nGenerated:")
print(f"  {len(users)} users, {len(warehouses)} warehouses, {len(products)} products")
print(f"  {len(suppliers)} suppliers, {len(customers)} customers")
print(f"  {len(purchase_orders)} POs ({sum(1 for p in purchase_orders if p['status']=='RECEIVED')} received, {sum(1 for p in purchase_orders if p['status']=='DRAFT')} draft)")
print(f"  {len(lots)} lots ({sum(1 for l in lots if l['source']=='PURCHASE')} from purchase, {sum(1 for l in lots if l['source']=='PRODUCTION')} from production)")
print(f"  {len(stock_movements)} stock movements")
print(f"  {len(recipes)} recipes, {len(production_orders)} production orders ({', '.join(p['status'] for p in production_orders)})")
print(f"  {len(sales_orders)} sales orders ({', '.join(s['status'] for s in sales_orders)})")
print(f"  {len(invoices)} invoices, {len(payments)} payments")
import os
size_kb = os.path.getsize('/home/claude/meat-erp/mock-data.json') / 1024
print(f"\nFile size: {size_kb:.1f} KB")
