import { Chip, Paper } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router";
import useLots from "../../hooks/useLots";
import useProducts from "../../hooks/useProducts";
import useWarehouse from "../../hooks/useWarehouse";
import { money, mul, sum } from "../../utilties/money";
import BackButton from "../common/BackButton";
import DataGridToolbar from "../common/DataGridToolbar";
import ExpiryBadge from "../common/ExpiryBadge";
import Status from "../common/StatusBadge";

function WarehouseDetail() {
  const { id } = useParams();
  const { t } = useTranslation();

  const { data: warehouses = [], isLoading: whLoading, error: whError } =
    useWarehouse();
  const { data: lots = [], isLoading: lotsLoading, error: lotsError } =
    useLots();
  const { data: products = [], isLoading: prodLoading } = useProducts();

  const warehouse = useMemo(
    () => warehouses.find((w) => w.id === id),
    [warehouses, id]
  );

  const warehouseLots = useMemo(
    () => lots.filter((l) => l.warehouseId === id),
    [lots, id]
  );

  const productNameById = useMemo(() => {
    const map = new Map<string, string>();
    products.forEach((p) => map.set(p.id, p.name));
    return map;
  }, [products]);

  const totalValue = useMemo(
    () => sum(warehouseLots.map((l) => mul(l.currentQuantity, l.unitCost))),
    [warehouseLots]
  );

  const availableCount = useMemo(
    () => warehouseLots.filter((l) => l.status === "AVAILABLE").length,
    [warehouseLots]
  );

  const columns: GridColDef[] = [
    {
      field: "lotNumber",
      headerName: t("warehouseDetail.lotNumber"),
      flex: 1,
      renderCell: (params) => (
        <Link to={`/lots/${params.id}`}>{params.row.lotNumber}</Link>
      ),
    },
    {
      field: "productId",
      headerName: t("warehouseDetail.product"),
      flex: 1,
      renderCell: (params) => (
        <p>{productNameById.get(params.value) ?? params.value}</p>
      ),
    },
    {
      field: "status",
      headerName: t("warehouseDetail.status"),
      flex: 1,
      renderCell: (params) => <Status status={params.value} />,
    },
    {
      field: "currentQuantity",
      headerName: t("warehouseDetail.currentQty"),
      flex: 1,
      renderCell: (params) => (
        <p>
          {params.value} {params.row.uom}
        </p>
      ),
    },
    {
      field: "unitCost",
      headerName: t("warehouseDetail.unitCost"),
      flex: 1,
      renderCell: (params) => (
        <p>
          {money(params.value)} {params.row.currency}
        </p>
      ),
    },
    {
      field: "value",
      headerName: t("warehouseDetail.value"),
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <p>
          {money(mul(params.row.currentQuantity, params.row.unitCost))}{" "}
          {params.row.currency}
        </p>
      ),
    },
    {
      field: "expiryDate",
      headerName: t("warehouseDetail.expiry"),
      flex: 1,
      renderCell: (params) => <ExpiryBadge expiryDate={params.row.expiryDate} />,
    },
  ];

  const paginationModel = { page: 0, pageSize: 5 };

  if (whLoading || lotsLoading || prodLoading)
    return <p>{t("common.loading")}</p>;
  if (whError) return <p>{whError.message}</p>;
  if (lotsError) return <p>{lotsError.message}</p>;

  if (!warehouse) {
    return (
      <div>
        <BackButton />
        <p className="mt-5">{t("warehouseDetail.notFound")}</p>
      </div>
    );
  }

  return (
    <div className="">
      <BackButton />
      <div className="flex items-center gap-3">
        <h2 className="text-3xl font-bold">{warehouse.name}</h2>
        <Chip
          label={t(`enums.${warehouse.type}`, { defaultValue: warehouse.type })}
          variant="outlined"
          color="info"
        />
      </div>
      <p className="text-gray-400">{t("warehouseDetail.subtitle")}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
        <div className="bg-white rounded-2xl border border-border p-[20px]">
          <p className="text-gray-500 text-sm">
            {t("warehouseDetail.totalLots")}
          </p>
          <p className="text-2xl font-bold mt-1">{warehouseLots.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-border p-[20px]">
          <p className="text-gray-500 text-sm">
            {t("warehouseDetail.totalValue")}
          </p>
          <p className="text-2xl font-bold mt-1">{money(totalValue)} UZS</p>
        </div>
        <div className="bg-white rounded-2xl border border-border p-[20px]">
          <p className="text-gray-500 text-sm">
            {t("warehouseDetail.available")}
          </p>
          <p className="text-2xl font-bold mt-1">
            {availableCount} / {warehouseLots.length}
          </p>
        </div>
      </div>

      <div className="mt-5">
        {warehouseLots.length === 0 ? (
          <p>{t("warehouseDetail.noLots")}</p>
        ) : (
          <Paper sx={{ height: "auto" }} style={{ borderRadius: "20px" }}>
            <DataGrid
              style={{ borderRadius: "20px" }}
              rows={warehouseLots}
              getRowId={(row) => row.id}
              columns={columns}
              initialState={{ pagination: { paginationModel } }}
              pageSizeOptions={[5, 10]}
              sx={{ border: 0 }}
              showToolbar
              slots={{ toolbar: DataGridToolbar }}
            />
          </Paper>
        )}
      </div>
    </div>
  );
}

export default WarehouseDetail;
