import React from "react";
import { DisplayCell, CellCoordinates } from "@/typings/types";
import GridCell from "./GridCell";

interface GridCellsProps {
  formattedGrid: DisplayCell[][];
  toggleCell: (cell: CellCoordinates) => void;
  isCellSelected: (cell: CellCoordinates) => boolean;
}

/**
 * GridCells maps over the grid and renders each individual GridCell.
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
            <GridCell
              key={`${cell.x}-${cell.y}`}
              cell={cell}
              gridRow={gridRow}
              gridColumn={gridColumn}
              isSelected={selected}
              toggleCell={toggleCell}
            />
          );
        })
      )}
    </>
  );
};

export default GridCells;
