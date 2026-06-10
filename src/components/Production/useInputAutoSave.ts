import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import productionService from "../../services/productionService";
import { CACHE_KEY_PRODUCTION_ORDER } from "../../constants.production";
import type {
  PatchInputPayload,
  ProductionOrderWithDetail,
} from "../../types/production";
import type { ProductionOrderInput } from "../../types";

export type SaveState = "saving" | "saved" | "error";

const DEBOUNCE_MS = 600;

interface RowQueue {
  timer: ReturnType<typeof setTimeout> | null;
  pending: PatchInputPayload | null; // coalesced edits waiting to flush
  chain: Promise<unknown>; // serializes PATCHes for this single row
}

// Debounced auto-save with ONE mutation queue per input row.
//
// Each row keeps its own promise chain: a new PATCH is appended to the
// previous one so two saves for the same row can never be in flight at
// once (no lost-update races). Edits that arrive while a request is in
// flight are coalesced into a single follow-up PATCH.
const useInputAutoSave = (orderId: string) => {
  const queryClient = useQueryClient();
  const queues = useRef<Map<string, RowQueue>>(new Map());
  const [status, setStatus] = useState<Record<string, SaveState>>({});

  const setRowStatus = useCallback((inputId: string, s: SaveState) => {
    setStatus((prev) => ({ ...prev, [inputId]: s }));
  }, []);

  const queueFor = (inputId: string): RowQueue => {
    let q = queues.current.get(inputId);
    if (!q) {
      q = { timer: null, pending: null, chain: Promise.resolve() };
      queues.current.set(inputId, q);
    }
    return q;
  };

  const flush = useCallback(
    (inputId: string) => {
      const q = queues.current.get(inputId);
      if (!q || !q.pending) return;
      const payload = q.pending;
      q.pending = null;
      setRowStatus(inputId, "saving");
      q.chain = q.chain
        .catch(() => undefined) // a prior failure must not break the chain
        .then(() => productionService.patchInput(orderId, inputId, payload))
        .then((updated: ProductionOrderInput) => {
          // Patch the cached order so the cumulative summary recomputes
          // without a full refetch (which would clobber in-progress edits).
          queryClient.setQueryData<ProductionOrderWithDetail>(
            CACHE_KEY_PRODUCTION_ORDER(orderId),
            (old) =>
              old
                ? {
                    ...old,
                    inputs: old.inputs.map((i) =>
                      i.id === inputId ? { ...i, ...updated } : i,
                    ),
                  }
                : old,
          );
          setRowStatus(inputId, "saved");
        })
        .catch(() => setRowStatus(inputId, "error"));
    },
    [orderId, queryClient, setRowStatus],
  );

  // Queue an edit. Coalesces with any pending edit for the same row and
  // (re)starts the debounce timer.
  const save = useCallback(
    (inputId: string, payload: PatchInputPayload) => {
      const q = queueFor(inputId);
      q.pending = { ...q.pending, ...payload };
      if (q.timer) clearTimeout(q.timer);
      q.timer = setTimeout(() => {
        q.timer = null;
        flush(inputId);
      }, DEBOUNCE_MS);
    },
    [flush],
  );

  // Flush every pending row immediately (e.g. before completing the order).
  const flushAll = useCallback(async () => {
    for (const [inputId, q] of queues.current) {
      if (q.timer) {
        clearTimeout(q.timer);
        q.timer = null;
      }
      flush(inputId);
    }
    await Promise.all(
      Array.from(queues.current.values()).map((q) =>
        q.chain.catch(() => undefined),
      ),
    );
  }, [flush]);

  // Clean up timers on unmount.
  useEffect(() => {
    const map = queues.current;
    return () => {
      for (const q of map.values()) if (q.timer) clearTimeout(q.timer);
    };
  }, []);

  return { save, flushAll, status };
};

export default useInputAutoSave;
