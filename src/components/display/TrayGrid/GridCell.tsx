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

    const plantName = cell.plant_name;
    const variety = cell.variety;
    const combined = variety ? `${plantName} ${variety}` : plantName;

    if (combined.length <= 8) {
      // Render inline for short text
      return (
        <div className="cell-content">
          <div className="plant-name" style={{ display: "inline-block", marginRight: "0.25em" }}>
            {plantName}
          </div>
          {variety && (
            <div className="variety" style={{ display: "inline-block" }}>
              {variety}
            </div>
          )}
        </div>
      );
    }

    // Render on separate lines for longer text
    return (
      <div className="cell-content">
        <div className="plant-name">{plantName}</div>
        {variety && <div className="variety">{variety}</div>}
      </div>
    );
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
