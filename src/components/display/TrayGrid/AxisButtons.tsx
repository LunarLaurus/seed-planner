import React from "react";
import { Tray, DisplayCell } from "@/typings/types";

interface AxisButtonsProps {
  tray: Tray;
  formattedGrid: DisplayCell[][];
  toggleRow: (displayRowIndex: number) => void;
  toggleColumn: (colIndex: number) => void;
}

/**
 * AxisButtons renders row and column selector buttons.
 */
const AxisButtons: React.FC<AxisButtonsProps> = ({ tray, formattedGrid, toggleRow, toggleColumn }) => {
  return (
    <>
      {/* Render row selection buttons in the first column */}
      {formattedGrid.map((_, displayRowIndex) => (
        <button
          key={`row-btn-${displayRowIndex}`}
          style={{ gridColumn: "1", gridRow: displayRowIndex + 1 }}
          onClick={() => toggleRow(displayRowIndex)}
          className="axis-btn"
        >
          {tray.rows - displayRowIndex - 1}
        </button>
      ))}
      {/* Render column selection buttons along the bottom row */}
      {Array.from({ length: tray.columns }, (_, colIndex) => (
        <button
          key={`col-btn-${colIndex}`}
          style={{ gridColumn: colIndex + 2, gridRow: tray.rows + 1 }}
          onClick={() => toggleColumn(colIndex)}
          className="axis-btn"
        >
          {colIndex}
        </button>
      ))}
    </>
  );
};

export default AxisButtons;
