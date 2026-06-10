import { Alert, Snackbar } from "@mui/material";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type Severity = "success" | "error";

interface ToastApi {
  success: (message: string) => void;
  error: (message: string) => void;
}

const ToastContext = createContext<ToastApi>({
  success: () => {},
  error: () => {},
});

export const useToast = () => useContext(ToastContext);

interface State {
  open: boolean;
  severity: Severity;
  message: string;
}

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<State>({
    open: false,
    severity: "success",
    message: "",
  });

  const show = useCallback((severity: Severity, message: string) => {
    setState({ open: true, severity, message });
  }, []);

  const close = useCallback(() => {
    setState((s) => ({ ...s, open: false }));
  }, []);

  const api = useMemo<ToastApi>(
    () => ({
      success: (message) => show("success", message),
      error: (message) => show("error", message),
    }),
    [show],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <Snackbar
        open={state.open}
        autoHideDuration={3000}
        onClose={close}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={state.severity}
          variant="filled"
          onClose={close}
          sx={{ width: "100%" }}
        >
          {state.message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
};
