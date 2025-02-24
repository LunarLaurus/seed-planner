// hooks/useSelectedCells.ts
import { useState } from "react";
import { CellCoordinates } from "@/typings/types";

export const useSelectedCells = () => {
  const [selectedCells, setSelectedCells] = useState<CellCoordinates[]>([]);

  const isCellSelected = (cell: CellCoordinates): boolean =>
    selectedCells.some((c) => c.x === cell.x && c.y === cell.y);

  const toggleCell = (cell: CellCoordinates) => {
    setSelectedCells((prev) => {
      const exists = prev.some((c) => c.x === cell.x && c.y === cell.y);
      return exists
        ? prev.filter((c) => !(c.x === cell.x && c.y === cell.y))
        : [...prev, cell];
    });
  };

  const clearSelection = () => setSelectedCells([]);

  return { selectedCells, toggleCell, setSelectedCells, isCellSelected, clearSelection };
};
