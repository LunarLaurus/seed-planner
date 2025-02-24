// hooks/useGridAxisSelection.ts
import { Tray, CellCoordinates } from "@/typings/types";
import { getRowCells, getColumnCells } from "@/utils/gridUtils";
import { Dispatch, SetStateAction } from "react";

export const useGridAxisSelection = (
  tray: Tray,
  isCellSelected: (cell: CellCoordinates) => boolean,
  setSelectedCells: Dispatch<SetStateAction<CellCoordinates[]>>
) => {
  const toggleRow = (displayRowIndex: number) => {
    const rowCells = getRowCells(tray, displayRowIndex);
    const allSelected = rowCells.every((cell) => isCellSelected(cell));
    setSelectedCells((prev) => {
      if (allSelected) {
        return prev.filter((cell) => cell.y !== rowCells[0].y);
      } else {
        const newCells = rowCells.filter((cell) => !isCellSelected(cell));
        return [...prev, ...newCells];
      }
    });
  };

  const toggleColumn = (colIndex: number) => {
    const colCells = getColumnCells(tray, colIndex);
    const allSelected = colCells.every((cell) => isCellSelected(cell));
    setSelectedCells((prev) => {
      if (allSelected) {
        return prev.filter((cell) => cell.x !== colIndex);
      } else {
        const newCells = colCells.filter((cell) => !isCellSelected(cell));
        return [...prev, ...newCells];
      }
    });
  };

  return { toggleRow, toggleColumn };
};
