import React from "react";
import { CellCoordinates, Plant, TrayCell } from "@/typings/types";

interface ControlPanelProps {
  selectedCells: CellCoordinates[];
  grid: TrayCell[]; // grid data to check whether cells contain a plant
  plants: Plant[] | undefined;
  selectedPlant: number | "";
  setSelectedPlant: (plant: number | "") => void;
  handleAssignPlant: () => void;
  handleResetCells: () => void;
  clearSelection: () => void;
}

/**
 * ControlPanel renders the controls for managing selected cells.
 * - The "Assign to Selected" button is enabled only if a valid plant (id > 0) is selected.
 * - The "Reset Selected" button is enabled if at least one selected cell already contains a plant.
 */
const ControlPanel: React.FC<ControlPanelProps> = ({
  selectedCells,
  grid,
  plants,
  selectedPlant,
  setSelectedPlant,
  handleAssignPlant,
  handleResetCells,
  clearSelection,
}) => {
  // A valid plant must have an id greater than 0.
  const isSelectedPlantValid = typeof selectedPlant === "number" && selectedPlant > 0;

  /**
   * Checks if at least one selected cell contains a plant.
   * It does so by matching the cell's coordinates with the grid and checking for a non-null plant_id.
   * @returns {boolean} True if any selected cell is occupied.
   */
  function doesAnySelectedCellContainPlantForResetting(): boolean {
    return selectedCells.some((cell) => {
      const correspondingCell = grid.find((c) => c.x === cell.x && c.y === cell.y);
      return correspondingCell && correspondingCell.plant_id != null;
    });
  }

  const canReset = doesAnySelectedCellContainPlantForResetting();

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
        <button
          className={`primary ${isSelectedPlantValid ? "" : "inactive"}`}
          disabled={!isSelectedPlantValid}
          onClick={handleAssignPlant}
        >
          Assign to Selected
        </button>
        <button
          className={`${canReset ? "reset" : "inactive"}`}
          disabled={!canReset}
          onClick={handleResetCells}
        >
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
