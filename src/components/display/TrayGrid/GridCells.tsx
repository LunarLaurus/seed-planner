import React from "react";
import { DisplayCell, CellCoordinates } from "@/typings/types";
import GridCell from "./GridCell";

interface GridCellsProps {
  formattedGrid: DisplayCell[][];
  toggleCell: (cell: CellCoordinates) => void;
  isCellSelected: (cell: CellCoordinates) => boolean;
  enableEditing: boolean;
}

/**
 * GridCells maps over the grid and renders each individual GridCell.
 * When editing is disabled, cells are rendered without click handlers or offsets.
 */
const GridCells: React.FC<GridCellsProps> = ({
  formattedGrid,
  toggleCell,
  isCellSelected,
  enableEditing,
}) => {
  return (
    <>
      {formattedGrid.map((row, displayRowIndex) =>
        row.map((cell) => {
          // Calculate grid position:
          // When editing is enabled, reserve the first column for axis buttons.
          const gridRow = displayRowIndex + 1;
          const gridColumn = enableEditing ? cell.x + 2 : cell.x + 1;
          const selected = enableEditing
            ? isCellSelected({ x: cell.x, y: cell.y })
            : false;
          const handleClick = enableEditing
            ? () => toggleCell({ x: cell.x, y: cell.y })
            : (undefined);
          return (
            <GridCell
              key={`${cell.x}-${cell.y}`}
              cell={cell}
              gridRow={gridRow}
              gridColumn={gridColumn}
              isSelected={selected}
              toggleCell={handleClick}
            />
          );
        })
      )}
    </>
  );
};

export default GridCells;
