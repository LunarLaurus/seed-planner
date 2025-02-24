import React from "react";
import { DisplayCell, CellCoordinates } from "@/typings/types";
import { splitVariety } from "@/utils/textSplitUtils";

export interface GridCellProps {
  cell: DisplayCell;
  gridRow: number;
  gridColumn: number;
  isSelected: boolean;
  toggleCell?: (cell: CellCoordinates) => void;
}

/**
 * GridCell renders a single cell and handles its own text rendering.
 */
const GridCell: React.FC<GridCellProps> = ({
  cell,
  gridRow,
  gridColumn,
  isSelected,
  toggleCell,
}) => {
  const renderCellTextContent = (): React.ReactNode => {
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
        {variety && (
          <div className="variety">
            {splitVariety(variety).map((chunk, i) => (
              <div key={`variety-${i}`}>{chunk}</div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const handleClick = () => {
    if (toggleCell) {
      toggleCell({ x: cell.x, y: cell.y });
    }
  };

  return (
    <div
      className={`grid-cell ${cell.plant_name ? "occupied" : ""} ${isSelected ? "selected" : ""}`}
      style={{ gridColumn, gridRow }}
      onClick={toggleCell ? handleClick : undefined}
    >
      {renderCellTextContent()}
    </div>
  );
};

export default GridCell;
