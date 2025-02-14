import React from "react";
import { CellCoordinates, Plant } from "@/typings/types";

interface ControlPanelProps {
  selectedCells: CellCoordinates[];
  plants: Plant[] | undefined;
  selectedPlant: number | "";
  setSelectedPlant: (plant: number | "") => void;
  handleAssignPlant: () => void;
  handleResetCells: () => void;
  clearSelection: () => void;
}

/**
 * ControlPanel renders the controls for managing selected cells.
 */
const ControlPanel: React.FC<ControlPanelProps> = ({
  selectedCells,
  plants,
  selectedPlant,
  setSelectedPlant,
  handleAssignPlant,
  handleResetCells,
  clearSelection,
}) => {
  return (
    <div className="cell-control">
      <h4>
        Manage {selectedCells.length} Selected Cell{selectedCells.length > 1 ? "s" : ""}
      </h4>
      <div className="selected-cells">
        {selectedCells.map((cell, idx) => (
          <span key={`selected-${cell.x}-${cell.y}-${idx}`}>
            ({cell.x}, {cell.y}){" "}
          </span>
        ))}
      </div>
      <div className="control-actions">
        <select onChange={(e) => setSelectedPlant(Number(e.target.value))} value={selectedPlant}>
          <option value="">Select Plant</option>
          {plants
            ?.sort((a, b) => a.name.localeCompare(b.name) || a.variety.localeCompare(b.variety))
            .map((plant) => (
              <option key={plant.id} value={plant.id}>
                {plant.name} - {plant.variety}
              </option>
            ))}
        </select>
        <button onClick={handleAssignPlant}>Assign to Selected</button>
        <button className="reset" onClick={handleResetCells}>
          Reset Selected
        </button>
      </div>
      <button className="cancel" onClick={clearSelection}>
        Clear Selection
      </button>
    </div>
  );
};

export default ControlPanel;