// utils/gridUtils.ts
import { Tray, TrayCell, DisplayCell, Plant } from "@/typings/types";

export const buildGrid = (tray: Tray, grid: TrayCell[], plants?: Plant[]): DisplayCell[][] => {
  const plantMap = new Map<number, { name: string; variety: string }>(
    plants?.map((p) => [p.id, { name: p.name, variety: p.variety }]) || []
  );

  return Array.from({ length: tray.rows }, (_, rowIndex) =>
    Array.from({ length: tray.columns }, (_, colIndex) => {
      const cell =
        grid.find((c) => c.x === colIndex && c.y === rowIndex) || {
          id: 0,
          tray_id: tray.id,
          x: colIndex,
          y: rowIndex,
          plant_id: null,
          planted_date: "",
        };
      return {
        ...cell,
        plant_name: cell.plant_id ? plantMap.get(cell.plant_id)?.name || null : null,
        variety: cell.plant_id ? plantMap.get(cell.plant_id)?.variety || null : null,
      };
    })
  );
};

export const formatGrid = (rawGrid: DisplayCell[][]): DisplayCell[][] => {
  return rawGrid.slice().reverse();
};

export const getRowCells = (tray: Tray, displayRowIndex: number): { x: number; y: number }[] => {
  const targetY = tray.rows - 1 - displayRowIndex;
  const rowCells = [];
  for (let x = 0; x < tray.columns; x++) {
    rowCells.push({ x, y: targetY });
  }
  return rowCells;
};

export const getColumnCells = (tray: Tray, colIndex: number): { x: number; y: number }[] => {
  const colCells = [];
  for (let y = 0; y < tray.rows; y++) {
    colCells.push({ x: colIndex, y });
  }
  return colCells;
};
