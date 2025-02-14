import React from "react";
import { DisplayCell, CellCoordinates } from "@/typings/types";

export interface GridCellProps {
  cell: DisplayCell;
  gridRow: number;
  gridColumn: number;
  isSelected: boolean;
  toggleCell: (cell: CellCoordinates) => void;
}

/**
 * GridCell renders a single cell and handles its own text rendering.
 */
const GridCell: React.FC<GridCellProps> = ({ cell, gridRow, gridColumn, isSelected, toggleCell }) => {

  const renderCellContent = (): React.ReactNode => {
    if (!cell.plant_name) return "-";
    var longPlantName = cell.plant_name + " " + cell.variety;
    if (longPlantName.length <= 10) return longPlantName;
    return longPlantName.split(" ").join("\n");
  };


  return (
    <div
      className={`grid-cell ${cell.plant_name ? "occupied" : ""} ${isSelected ? "selected" : ""}`}
      style={{ gridColumn, gridRow }}
      onClick={() => toggleCell({ x: cell.x, y: cell.y })}
    >
      {renderCellContent()}
    </div>
  );
};

export default GridCell;
