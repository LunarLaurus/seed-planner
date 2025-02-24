// components/TrayGrid.tsx
import React, { useState } from "react";
import { useTrayGridData } from "@/hooks/useTrayGridData";
import { useSelectedCells } from "@/hooks/useSelectedCells";
import { buildGrid, formatGrid } from "@/utils/gridUtils";
import AxisButtons from "./AxisButtons";
import GridCells from "./GridCells";
import ControlPanel from "./ControlPanel";
import { useGridAxisSelection } from "@/hooks/useGridAxisSelection";
import "@/styles/TrayGrid.css";

interface TrayGridProps {
    trayId: number;
    enableVisibilityButton?: boolean;
    enableEditing?: boolean;
}

const TrayGrid: React.FC<TrayGridProps> = ({
    trayId,
    enableVisibilityButton = true,
    enableEditing = true,
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const {
        selectedCells,
        toggleCell,
        clearSelection,
        isCellSelected,
        setSelectedCells,
    } = useSelectedCells();
    const {
        trayData,
        isLoading,
        isError,
        plants,
        assignPlantMutation,
        resetCellMutation,
    } = useTrayGridData(trayId, isVisible);
    const [selectedPlant, setSelectedPlant] = useState<number | "">("");

    if (!isVisible) {
        if (enableVisibilityButton) {
            return (
                <div className="tray-hidden">
                    <button className="grid-toggle-btn" onClick={() => setIsVisible(true)}>
                        Show Grid
                    </button>
                </div>
            );
        } else {
            setIsVisible(true);
        }
    }

    if (isLoading) return <p>Loading tray grid...</p>;
    if (isError || !trayData || !trayData.tray)
        return <p>Error loading tray grid.</p>;

    const { tray, grid } = trayData;
    const rawGrid = buildGrid(tray, grid, plants);
    const formattedGrid = formatGrid(rawGrid);

    // Only enable axis selection if editing is allowed.
    const { toggleRow, toggleColumn } = useGridAxisSelection(
        tray,
        isCellSelected,
        setSelectedCells
    );

    // When editing is disabled, override toggle/cell-check functions.
    const effectiveToggleCell = enableEditing ? toggleCell : () => { };
    const effectiveIsCellSelected = enableEditing ? isCellSelected : () => false;

    const handleAssignPlant = () => {
        if (selectedCells.length > 0 && selectedPlant !== "") {
            selectedCells.forEach((cell) => {
                assignPlantMutation.mutate({
                    x: cell.x,
                    y: cell.y,
                    plant_id: Number(selectedPlant),
                    planted_date: new Date().toISOString().split("T")[0],
                });
            });
            clearSelection();
            setSelectedPlant("");
        }
    };

    const handleResetCells = () => {
        if (selectedCells.length > 0) {
            selectedCells.forEach((cell) => {
                resetCellMutation.mutate(cell);
            });
            clearSelection();
        }
    };

    return (
        <div className="tray-container">
            <h3>{tray.name} Grid</h3>
            {enableVisibilityButton && (
                <div className="hide-grid-container">
                    <button className="grid-toggle-btn" onClick={() => setIsVisible(false)}>
                        Hide Grid
                    </button>
                </div>
            )}
            {/* Adjust grid layout based on editing mode */}
            <div
                className="tray-grid-container"
                style={{
                    display: "grid",
                    gridTemplateColumns: enableEditing
                        ? `50px repeat(${tray.columns}, 50px)`
                        : `repeat(${tray.columns}, 50px)`,
                    gridTemplateRows: enableEditing
                        ? `repeat(${tray.rows}, 50px) 50px`
                        : `repeat(${tray.rows}, 50px)`,
                    justifyItems: "center",
                    alignItems: "center",
                }}
            >
                {enableEditing && <div style={{ gridColumn: "1", gridRow: "1" }} />}
                {enableEditing && (
                    <AxisButtons
                        tray={tray}
                        formattedGrid={formattedGrid}
                        toggleRow={toggleRow}
                        toggleColumn={toggleColumn}
                    />
                )}
                <GridCells
                    formattedGrid={formattedGrid}
                    toggleCell={effectiveToggleCell}
                    isCellSelected={effectiveIsCellSelected}
                    enableEditing={enableEditing}
                />
            </div>
            {enableEditing && selectedCells.length > 0 && (
                <ControlPanel
                    selectedCells={selectedCells}
                    plants={plants}
                    selectedPlant={selectedPlant}
                    setSelectedPlant={setSelectedPlant}
                    handleAssignPlant={handleAssignPlant}
                    handleResetCells={handleResetCells}
                    clearSelection={clearSelection}
                    grid={grid}
                />
            )}
        </div>
    );
};

export default TrayGrid;
