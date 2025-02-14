import React from "react";
import { DisplayCell, CellCoordinates } from "@/typings/types";

interface GridCellsProps {
  formattedGrid: DisplayCell[][];
  toggleCell: (cell: CellCoordinates) => void;
  isCellSelected: (cell: CellCoordinates) => boolean;
}

/**
 * GridCells renders the individual cells of the tray grid.
 */
const GridCells: React.FC<GridCellsProps> = ({ formattedGrid, toggleCell, isCellSelected }) => {
  return (
    <>
      {formattedGrid.map((row, displayRowIndex) =>
        row.map((cell) => {
          // Calculate grid position: first column is reserved for axis buttons
          const gridRow = displayRowIndex + 1;
          const gridColumn = cell.x + 2;
          const selected = isCellSelected({ x: cell.x, y: cell.y });
          return (
            <div
              key={`${cell.x}-${cell.y}`}
              className={`grid-cell ${cell.plant_name ? "occupied" : ""} ${selected ? "selected" : ""}`}
              style={{ gridColumn, gridRow }}
              onClick={() => toggleCell({ x: cell.x, y: cell.y })}
            >
              {cell.plant_name ? cell.plant_name : "-"}
            </div>
          );
        })
      )}
    </>
  );
};

export default GridCells;
