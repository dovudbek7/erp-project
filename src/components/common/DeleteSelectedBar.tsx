import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { useState } from "react";
import { FiTrash2 } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import useBulkDelete from "../../hooks/useBulkDelete";
import { useToast } from "./ToastContext";

interface Props {
  selectedIds: string[];
  endpoint: string;
  queryKey: unknown[];
  label?: string; // kept for API compatibility; not shown (entity-noun is locale-specific)
  onDone: () => void; // clear selection
}

const DeleteSelectedBar = ({
  selectedIds,
  endpoint,
  queryKey,
  onDone,
}: Props) => {
  const { t } = useTranslation();
  const toast = useToast();
  const { mutate, isPending } = useBulkDelete(endpoint, queryKey);
  const [confirm, setConfirm] = useState(false);

  if (selectedIds.length === 0) return null;
  const n = selectedIds.length;

  const doDelete = () => {
    mutate(selectedIds, {
      onSuccess: () => {
        toast.success(t("common.deleteSuccess", { count: n }));
        setConfirm(false);
        onDone();
      },
      onError: () => toast.error(t("common.deleteError")),
    });
  };

  return (
    <div className="flex items-center justify-between bg-white border border-border rounded-xl px-4 py-2 mb-3">
      <span className="text-sm text-gray-600">{t("common.selected", { n })}</span>
      <Button
        size="small"
        color="error"
        variant="contained"
        startIcon={<FiTrash2 />}
        onClick={() => setConfirm(true)}
      >
        {t("common.delete")}
      </Button>

      <Dialog open={confirm} onClose={() => setConfirm(false)}>
        <DialogTitle>{t("common.deleteConfirmTitle", { count: n })}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t("common.deleteConfirmBody")}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirm(false)} color="inherit">
            {t("common.cancel")}
          </Button>
          <Button
            variant="contained"
            color="error"
            disabled={isPending}
            onClick={doDelete}
          >
            {isPending ? t("common.deleting") : t("common.delete")}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default DeleteSelectedBar;
