import { useState } from "react";
import type {
  GridRowId,
  GridRowSelectionModel,
} from "@mui/x-data-grid";

const empty = (): GridRowSelectionModel => ({
  type: "include",
  ids: new Set<GridRowId>(),
});

// Wraps the MUI DataGrid selection model (shape `{type, ids:Set}` in this
// version) and exposes the selected ids as a plain string[].
const useGridSelection = () => {
  const [rowSelectionModel, setRowSelectionModel] =
    useState<GridRowSelectionModel>(empty());

  const selectedIds = Array.from(rowSelectionModel.ids ?? []).map(String);

  return {
    rowSelectionModel,
    onRowSelectionModelChange: setRowSelectionModel,
    selectedIds,
    clear: () => setRowSelectionModel(empty()),
  };
};

export default useGridSelection;
