import { useState } from "react";
import {
  Autocomplete,
  Chip,
  Skeleton,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { FiGitBranch } from "react-icons/fi";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import useLots from "../../hooks/useLots";
import useTraceability from "../../hooks/useTraceability";
import DelayedSkeleton from "../common/DelayedSkeleton";
import EmptyState from "../common/EmptyState";
import ExpiryBadge from "../common/ExpiryBadge";
import type { TraceDirection, TraceNode } from "../../types/reports";
import BackButton from "../common/BackButton";

const SOURCE_KEY: Record<string, string> = {
  PURCHASE: "reports.purchased",
  PRODUCTION: "reports.produced",
};

function TraceTreeNode({
  node,
  onSelect,
  onOpenLot,
}: {
  node: TraceNode;
  onSelect: (lotId: string) => void;
  onOpenLot: (lotId: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <li className="list-none">
      <div className="border border-border rounded-xl p-3 bg-white inline-block min-w-[260px]">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => onSelect(node.lotId)}
            className="font-semibold text-left text-blue-700 hover:underline focus:outline-2 focus:outline-blue-500 rounded"
            aria-label={`${node.lotNumber}`}
          >
            {node.lotNumber}
          </button>
          <Chip
            size="small"
            variant="outlined"
            label={SOURCE_KEY[node.source] ? t(SOURCE_KEY[node.source]) : node.source}
            color={node.source === "PRODUCTION" ? "info" : "default"}
          />
        </div>
        <p className="text-gray-500 text-xs mt-1">{node.productName}</p>
        <div className="flex items-center gap-2 mt-2 text-xs text-gray-600">
          <span>
            {node.quantity} {node.uom}
          </span>
          <span>· {node.unitCost}/{node.uom}</span>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <ExpiryBadge expiryDate={node.expiryDate} />
          <button
            type="button"
            onClick={() => onOpenLot(node.lotId)}
            className="text-blue-600 text-xs hover:underline focus:outline-2 focus:outline-blue-500 rounded"
          >
            {t("reports.openLot")}
          </button>
        </div>
      </div>

      {node.children.length > 0 && (
        <ul className="pl-6 mt-3 border-l-2 border-border flex flex-col gap-3 m-0">
          {node.children.map((c) => (
            <TraceTreeNode
              key={`${c.lotId}-${c.depth}`}
              node={c}
              onSelect={onSelect}
              onOpenLot={onOpenLot}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

function Traceability() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: lots = [] } = useLots();
  const [lotId, setLotId] = useState("");
  const [direction, setDirection] = useState<TraceDirection>("backward");

  const { data, error, isLoading } = useTraceability(lotId, direction);

  const options = lots.map((l) => ({ id: l.id, label: l.lotNumber }));
  const selected = options.find((o) => o.id === lotId) ?? null;

  return (
    <div>
      <BackButton />
      <h1 className="text-3xl font-bold">{t("reports.traceTitle")}</h1>
      <p className="text-gray-400">{t("reports.traceDesc")}</p>

      <div className="mt-5 flex flex-wrap gap-4 items-center">
        <Autocomplete
          options={options}
          value={selected}
          onChange={(_e, v) => setLotId(v?.id ?? "")}
          isOptionEqualToValue={(o, v) => o.id === v.id}
          sx={{ width: 320 }}
          renderInput={(params) => (
            <TextField {...params} label={t("reports.lot")} size="small" />
          )}
        />

        <ToggleButtonGroup
          value={direction}
          exclusive
          size="small"
          onChange={(_e, v) => v && setDirection(v)}
          aria-label={t("reports.traceTitle")}
        >
          <ToggleButton value="backward" aria-label={t("reports.backward")}>
            {t("reports.backward")}
          </ToggleButton>
          <ToggleButton value="forward" aria-label={t("reports.forward")}>
            {t("reports.forward")}
          </ToggleButton>
        </ToggleButtonGroup>
      </div>

      {error && (
        <p className="text-red-600 mt-4" role="alert">
          {t("reports.traceError")}: {error.message}
        </p>
      )}

      <div className="mt-5">
        {!lotId && (
          <EmptyState
            title={t("reports.pickLot")}
            description={t("reports.pickLotDesc")}
            icon={<FiGitBranch />}
          />
        )}

        {lotId && (
          <DelayedSkeleton
            loading={isLoading}
            skeleton={<Skeleton variant="rounded" height={220} />}
          >
            {data && (
              <div
                className="bg-white border border-border rounded-2xl p-5 overflow-x-auto"
                aria-label={t("reports.traceTitle")}
              >
                <p className="text-gray-400 text-xs mb-3">
                  {direction === "backward"
                    ? t("reports.backwardHint")
                    : t("reports.forwardHint")}
                </p>
                <ul className="m-0 p-0">
                  <TraceTreeNode
                    node={data.root}
                    onSelect={setLotId}
                    onOpenLot={(id) => navigate(`/lots/${id}`)}
                  />
                </ul>
              </div>
            )}
          </DelayedSkeleton>
        )}
      </div>
    </div>
  );
}

export default Traceability;
