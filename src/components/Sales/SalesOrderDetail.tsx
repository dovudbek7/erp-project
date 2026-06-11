import { useMemo } from "react";
import { Link, useParams } from "react-router";
import useCustomers from "../../hooks/useCustomers";
import useProducts from "../../hooks/useProducts";
import useSalesOrder from "../../hooks/useSalesOrder";
import ConfirmedView from "./ConfirmedView";
import DeliveredView from "./DeliveredView";
import DraftView from "./DraftView";
import PickedView from "./PickedView";
import { productMap } from "./SalesOrderParts";

function SalesOrderDetail() {
  const { id = "" } = useParams();
  const { data: order, isLoading, error } = useSalesOrder(id);
  const { data: products = [] } = useProducts();
  const { data: customers = [] } = useCustomers();

  const productName = useMemo(() => productMap(products), [products]);
  const customerName = useMemo(() => {
    const m = new Map(customers.map((c) => [c.id, c.name]));
    return (cid: string) => m.get(cid) ?? cid;
  }, [customers]);

  if (isLoading) return <p>Loading…</p>;
  if (error) return <p>{error.message}</p>;
  if (!order) return <p>Order not found.</p>;

  const cname = customerName(order.customerId);

  return (
    <div>
      <Link to="/sales/orders" className="text-blue-600 text-sm">
        ← Sales orders
      </Link>
      <div className="mt-3">
        {order.status === "DRAFT" && (
          <DraftView
            order={order}
            customerName={cname}
            productName={productName}
          />
        )}
        {order.status === "CONFIRMED" && (
          <ConfirmedView
            order={order}
            customerName={cname}
            productName={productName}
          />
        )}
        {order.status === "PICKED" && (
          <PickedView
            order={order}
            customerName={cname}
            productName={productName}
          />
        )}
        {order.status === "DELIVERED" && (
          <DeliveredView
            order={order}
            customerName={cname}
            productName={productName}
          />
        )}
        {(order.status === "INVOICED" ||
          order.status === "SHIPPED" ||
          order.status === "CANCELLED") && (
          <DeliveredView
            order={order}
            customerName={cname}
            productName={productName}
            terminalNote={`Order ${order.status.toLowerCase()}.`}
          />
        )}
      </div>
    </div>
  );
}

export default SalesOrderDetail;
