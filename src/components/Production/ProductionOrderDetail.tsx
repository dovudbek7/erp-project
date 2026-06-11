import { useMemo } from "react";
import { Link, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import useProductionOrder from "../../hooks/useProductionOrder";
import useProducts from "../../hooks/useProducts";
import type { Product } from "../../types";
import DraftView from "./DraftView";
import InProgressView from "./InProgressView";
import CompletedView from "./CompletedView";

function ProductionOrderDetail() {
  const { t } = useTranslation();
  const { id = "" } = useParams();
  const { data: order, error, isLoading } = useProductionOrder(id);
  const { data: products = [] } = useProducts();

  const productsById = useMemo(() => {
    const m = new Map<string, Product>();
    products.forEach((p) => m.set(p.id, p));
    return m;
  }, [products]);

  if (isLoading) return <p>{t("production.loading")}</p>;
  if (error) return <p>{error.message}</p>;
  if (!order) return <p>{t("production.notFound")}</p>;

  return (
    <div>
      <Link to="/production/orders" className="text-blue-600 text-sm">
        ← {t("production.ordersBack")}
      </Link>
      <div className="mt-3">
        {order.status === "DRAFT" && (
          <DraftView order={order} productsById={productsById} />
        )}
        {order.status === "IN_PROGRESS" && (
          <InProgressView order={order} productsById={productsById} />
        )}
        {(order.status === "COMPLETED" || order.status === "CANCELLED") && (
          <CompletedView order={order} productsById={productsById} />
        )}
      </div>
    </div>
  );
}

export default ProductionOrderDetail;
