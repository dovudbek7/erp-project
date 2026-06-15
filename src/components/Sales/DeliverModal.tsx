import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { useState } from "react";
import useDeliverSalesOrder from "../../hooks/useDeliverSalesOrder";
import { useToast } from "../common/ToastContext";

const today = new Date().toISOString().split("T")[0];

interface Props {
  orderId: string;
  open: boolean;
  onClose: () => void;
}

function DeliverModal({ orderId, open, onClose }: Props) {
  const toast = useToast();
  const { mutate, isPending } = useDeliverSalesOrder(orderId);
  const [deliveredDate, setDeliveredDate] = useState(today);
  const [notes, setNotes] = useState("");

  const submit = () => {
    mutate(
      { deliveredDate, notes: notes || null },
      {
        onSuccess: () => {
          toast.success("Order delivered");
          onClose();
        },
        onError: () => toast.error("Failed to deliver order"),
      },
    );
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Deliver order</DialogTitle>
      <DialogContent>
        <div className="flex flex-col gap-4 mt-1">
          <TextField
            type="date"
            label="Delivered date"
            slotProps={{ inputLabel: { shrink: true } }}
            value={deliveredDate}
            onChange={(e) => setDeliveredDate(e.target.value)}
            fullWidth
          />
          <TextField
            label="Notes"
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
          Cancel
        </Button>
        <Button
          onClick={submit}
          variant="contained"
          color="error"
          disabled={isPending || !deliveredDate}
        >
          Confirm delivery
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default DeliverModal;
