import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import useDeliverSalesOrder from "../../hooks/useDeliverSalesOrder";
import { useToast } from "../common/ToastContext";

const today = new Date().toISOString().split("T")[0];

interface Props {
  orderId: string;
  open: boolean;
  onClose: () => void;
}

function DeliverModal({ orderId, open, onClose }: Props) {
  const { t } = useTranslation();
  const toast = useToast();
  const { mutate, isPending } = useDeliverSalesOrder(orderId);
  const [deliveredDate, setDeliveredDate] = useState(today);
  const [notes, setNotes] = useState("");

  const submit = () => {
    mutate(
      { deliveredDate, notes: notes || null },
      {
        onSuccess: () => {
          toast.success(t("sales.deliver.deliveredSuccess"));
          onClose();
        },
        onError: () => toast.error(t("sales.deliver.deliverError")),
      },
    );
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{t("sales.deliver.title")}</DialogTitle>
      <DialogContent>
        <div className="flex flex-col gap-4 mt-1">
          <TextField
            type="date"
            label={t("sales.deliver.deliveredDate")}
            slotProps={{ inputLabel: { shrink: true } }}
            value={deliveredDate}
            onChange={(e) => setDeliveredDate(e.target.value)}
            fullWidth
          />
          <TextField
            label={t("sales.deliver.notes")}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            multiline
            minRows={2}
            fullWidth
          />
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          {t("common.cancel")}
        </Button>
        <Button
          onClick={submit}
          variant="contained"
          color="error"
          disabled={isPending || !deliveredDate}
        >
          {t("sales.deliver.confirmDelivery")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default DeliverModal;
