import { http, HttpResponse, delay } from "msw";
import mockDataRaw from "./mock-data.json";

const mockData = mockDataRaw as any;

export const handlers = [
  http.get("/api/tenant", async () => {
    await delay(500);
    return HttpResponse.json(mockData.tenant);
  }),

  http.get("/api/users", () => {
    return HttpResponse.json(mockData.users);
  }),

  http.get("/api/products", () => {
    return HttpResponse.json(mockData.products);
  }),
  http.get("/api/warehouses", () => {
    return HttpResponse.json(mockData.warehouses);
  }),

  http.get("/api/products/:id", ({ params }) => {
    const { id } = params;
    const product = mockData.products.find((p: any) => p.id === id);
    return product
      ? HttpResponse.json(product)
      : new HttpResponse(null, { status: 404 });
  }),

  http.get("/api/customers", () => {
    return HttpResponse.json(mockData.customers);
  }),

  http.get("/api/sales-orders", () => {
    return HttpResponse.json(mockData.salesOrders);
  }),

  http.get("/api/sales-orders/:id", ({ params }) => {
    const { id } = params;
    const order = mockData.salesOrders.find((o: any) => o.id === id);
    if (order) {
      const items = mockData.salesOrderItems.filter(
        (item: any) => item.salesOrderId === id,
      );
      return HttpResponse.json({ ...order, items });
    }
    return new HttpResponse(null, { status: 404 });
  }),

  http.get("/api/invoices", () => {
    return HttpResponse.json(mockData.invoices);
  }),

  http.get("/api/invoices/:id", ({ params }) => {
    const { id } = params;
    const invoice = mockData.invoices.find((inv: any) => inv.id === id);
    return invoice
      ? HttpResponse.json(invoice)
      : new HttpResponse(null, { status: 404 });
  }),

  http.get("/api/lots", () => {
    return HttpResponse.json(mockData.lots);
  }),

  http.get("/api/inventory-movements", () => {
    return HttpResponse.json(mockData.inventoryMovements);
  }),

  http.post("/api/:collection", async ({ params, request }) => {
    const { collection } = params;
    const newData = await request.json();

    console.log(`${collection} ga yangi ma'lumot qo'shildi:`, newData);

    return HttpResponse.json(
      {
        // ...newData,
        id: `new-id-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
      },
      { status: 201 },
    );
  }),
];
