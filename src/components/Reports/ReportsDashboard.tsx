import { Skeleton } from "@mui/material";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { FiAlertTriangle, FiBox, FiActivity, FiTrendingUp, FiDollarSign } from "react-icons/fi";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import type { ReactNode } from "react";
import useDashboard from "../../hooks/useDashboard";
import DelayedSkeleton from "../common/DelayedSkeleton";
import EmptyState from "../common/EmptyState";
import ExpiryBadge from "../common/ExpiryBadge";
import { formatMoney, formatNumber, shortDate } from "./reportsUtils";
import type { ExpiringLot } from "../../types/reports";

function KpiCard({
  label,
  value,
  sub,
  icon,
  tone = "default",
}: {
  label: string;
  value: string;
  sub?: string;
  icon: ReactNode;
  tone?: "default" | "warning" | "success";
}) {
  const toneCls =
    tone === "warning"
      ? "text-amber-600"
      : tone === "success"
        ? "text-green-600"
        : "text-blue-600";
  return (
    <li className="bg-white border border-border rounded-2xl p-5 list-none">
      <div className="flex items-center justify-between">
        <span className="text-gray-500 text-sm">{label}</span>
        <span className={`text-xl ${toneCls}`} aria-hidden="true">
          {icon}
        </span>
      </div>
      <p className="text-2xl font-bold mt-2">{value}</p>
      {sub && <p className="text-gray-400 text-xs mt-1">{sub}</p>}
    </li>
  );
}

function ExpiringWidget({
  lots,
  onOpen,
}: {
  lots: ExpiringLot[];
  onOpen: (lotId: string) => void;
}) {
  const { t } = useTranslation();
  if (lots.length === 0)
    return (
      <EmptyState
        title={t("reports.nothingExpiring")}
        description={t("reports.nothingExpiringDesc")}
        icon={<FiBox />}
      />
    );

  return (
    <div className="overflow-x-auto">
    <table className="w-full text-sm" aria-label={t("reports.expiringThisWeek")}>
      <caption className="sr-only">{t("reports.expiringThisWeek")}</caption>
      <thead>
        <tr className="text-left text-gray-500 border-b border-border">
          <th scope="col" className="py-2 font-medium">
            {t("reports.lot")}
          </th>
          <th scope="col" className="py-2 font-medium">
            {t("reports.product")}
          </th>
          <th scope="col" className="py-2 font-medium text-right">
            {t("reports.qty")}
          </th>
          <th scope="col" className="py-2 font-medium text-right">
            {t("reports.expiry")}
          </th>
        </tr>
      </thead>
      <tbody>
        {lots.map((l) => (
          <tr
            key={l.lotId}
            tabIndex={0}
            role="button"
            aria-label={`${t("reports.openLot")} ${l.lotNumber}`}
            onClick={() => onOpen(l.lotId)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onOpen(l.lotId);
              }
            }}
            className="border-b border-border last:border-0 cursor-pointer hover:bg-gray-50 focus:bg-blue-50 focus:outline-2 focus:outline-blue-500"
          >
            <td className="py-2 font-medium">{l.lotNumber}</td>
            <td className="py-2 text-gray-600">{l.productName}</td>
            <td className="py-2 text-right">
              {l.currentQuantity} {l.uom}
            </td>
            <td className="py-2 text-right">
              <ExpiryBadge expiryDate={l.expiryDate} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    </div>
  );
}

function ReportsDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data, error, isLoading } = useDashboard();

  return (
    <div>
      <h1 className="text-3xl font-bold">{t("reports.dashboardTitle")}</h1>
      <p className="text-gray-400">{t("reports.dashboardDesc")}</p>

      {error && (
        <p className="text-red-600 mt-4" role="alert">
          {t("reports.dashboardError")}: {error.message}
        </p>
      )}

      <DelayedSkeleton
        loading={isLoading}
        skeleton={
          <div className="mt-6 grid grid-cols-2 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" height={110} />
            ))}
          </div>
        }
      >
        {data && (
          <>
            {/* KPI cards */}
            <ul className="mt-6 grid grid-cols-2 lg:grid-cols-5 gap-4 p-0 m-0">
              <KpiCard
                label={t("reports.stockOnHand")}
                value={formatMoney(data.stockOnHandValue, data.currency)}
                icon={<FiDollarSign />}
              />
              <KpiCard
                label={t("reports.lotsExpiringSoon")}
                value={String(data.lotsExpiringSoon.length)}
                sub={t("reports.within7")}
                tone="warning"
                icon={<FiAlertTriangle />}
              />
              <KpiCard
                label={t("reports.activeProduction")}
                value={String(data.activeProductionOrders)}
                sub={t("reports.draftInProgress")}
                icon={<FiActivity />}
              />
              <KpiCard
                label={t("reports.todayOutput")}
                value={`${formatNumber(data.todayProductionOutput)} kg`}
                tone="success"
                icon={<FiTrendingUp />}
              />
              <KpiCard
                label={t("reports.outstandingAR")}
                value={formatMoney(data.outstandingAR, data.currency)}
                icon={<FiDollarSign />}
              />
            </ul>

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-5 items-start">
              {/* 30-day output chart */}
              <section
                className="bg-white border border-border rounded-2xl p-5"
                aria-label={t("reports.productionOutput")}
              >
                <h2 className="font-semibold mb-1">
                  {t("reports.productionOutput")}
                </h2>
                <p className="text-gray-400 text-xs mb-4">
                  {t("reports.last30")}
                </p>
                <div style={{ width: "100%", height: 260 }}>
                  <ResponsiveContainer>
                    <AreaChart
                      data={data.productionOutput30d}
                      margin={{ top: 5, right: 10, bottom: 0, left: -10 }}
                    >
                      <defs>
                        <linearGradient id="out" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={shortDate}
                        tick={{ fontSize: 11 }}
                        interval={4}
                      />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip
                        labelFormatter={(l) => shortDate(String(l))}
                        formatter={(v) => [`${v} kg`, t("reports.output")]}
                      />
                      <Area
                        type="monotone"
                        dataKey="quantity"
                        stroke="#3b82f6"
                        fill="url(#out)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </section>

              {/* Expiring widget */}
              <section className="bg-white border border-border rounded-2xl p-5">
                <h2 className="font-semibold mb-3">
                  {t("reports.expiringThisWeek")}
                </h2>
                <ExpiringWidget
                  lots={data.lotsExpiringSoon}
                  onOpen={(id) => navigate(`/lots/${id}`)}
                />
              </section>
            </div>
          </>
        )}
      </DelayedSkeleton>
    </div>
  );
}

export default ReportsDashboard;
