import { useQuery, useMutation, useQueryClient, UseMutationResult } from "@tanstack/react-query";
import { useState } from "react";
import {
    fetchTrayGrid,
    fetchPlants,
    assignPlantToCell,
    resetTrayCell,
} from "@/utils/api";
import "@/styles/TrayGrid.css";
import { TrayCell, Tray, Plant, Cell, CellCoordinates } from "@/typings/types";
import AxisButtons from "./AxisButtons";
import GridCells from "./GridCells";
import ControlPanel from "./ControlPanel";

// Extended type for displaying grid cells
export interface DisplayCell extends TrayCell {
    plant_name?: string | null;
    variety?: string | null;
}

/**
 * TrayGrid displays the tray's grid with multi-cell selection,
 * axis buttons for row/column selection, and a control panel for managing selected cells.
 */
const TrayGrid: React.FC<{ trayId: number }> = ({ trayId }) => {
    const queryClient = useQueryClient();
    const [isVisible, setIsVisible] = useState(false);
    const [selectedCells, setSelectedCells] = useState<CellCoordinates[]>([]);
    const [selectedPlant, setSelectedPlant] = useState<number | "">("");

    // Fetch tray grid data
    const { data, isLoading, isError } = useQuery<{ tray: Tray; grid: TrayCell[] }>({
        queryKey: ["trayGrid", trayId],
        queryFn: () => fetchTrayGrid(trayId),
        enabled: !!trayId && isVisible,
    });

    // Fetch plant list
    const { data: plants } = useQuery<Plant[]>({
        queryKey: ["plants"],
        queryFn: fetchPlants,
    });

    // Mutation: Assign plant to a cell
    const assignPlantMutation: UseMutationResult<Cell, Error, Cell> = useMutation({
        mutationFn: (cell) => assignPlantToCell(trayId, cell),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["trayGrid", trayId] }),
    });

    // Mutation: Reset cell (returns void)
    const resetCellMutation: UseMutationResult<void, Error, CellCoordinates> = useMutation({
        mutationFn: (coords) => resetTrayCell(trayId, coords),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["trayGrid", trayId] }),
    });

    if (!isVisible) {
        return (
            <div className="tray-hidden">
                <button className="grid-toggle-btn" onClick={() => setIsVisible(true)}>
                    Show Grid
                </button>
            </div>
        );
    }

    if (isLoading) return <p>Loading tray grid...</p>;
    if (isError || !data || !data.tray) return <p>Error loading tray grid.</p>;

    const { tray, grid } = data;
    const plantMap = new Map<number, { name: string; variety: string }>(
        plants?.map((p) => [p.id, { name: p.name, variety: p.variety }]) || []
    );

    // Build the grid as a 2D array (rawGrid) with row 0 as the bottom.
    const rawGrid: DisplayCell[][] = Array.from({ length: tray.rows }, (_, rowIndex) =>
        Array.from({ length: tray.columns }, (_, colIndex) => {
            const cell =
                grid.find((c) => c.x === colIndex && c.y === rowIndex) || {
                    id: 0,
                    tray_id: tray.id,
                    x: colIndex,
                    y: rowIndex,
                    plant_id: null,
                    planted_date: "",
                };
            return {
                ...cell,
                plant_name: cell.plant_id ? plantMap.get(cell.plant_id)?.name || null : null,
                variety: cell.plant_id ? plantMap.get(cell.plant_id)?.variety || null : null,
            };
        })
    );
    // Reverse rawGrid for display so that bottom row is at the bottom.
    const formattedGrid = rawGrid.slice().reverse();

    const isCellSelected = (cell: CellCoordinates): boolean =>
        selectedCells.some((c) => c.x === cell.x && c.y === cell.y);

    const toggleCell = (cell: CellCoordinates) => {
        setSelectedCells((prev) => {
            const exists = prev.some((c) => c.x === cell.x && c.y === cell.y);
            return exists ? prev.filter((c) => !(c.x === cell.x && c.y === cell.y)) : [...prev, cell];
        });
    };

    const toggleRow = (displayRowIndex: number) => {
        const targetY = tray.rows - 1 - displayRowIndex;
        const rowCells: CellCoordinates[] = [];
        for (let x = 0; x < tray.columns; x++) {
            rowCells.push({ x, y: targetY });
        }
        const allSelected = rowCells.every((cell) => isCellSelected(cell));
        setSelectedCells((prev) => {
            if (allSelected) {
                return prev.filter((cell) => cell.y !== targetY);
            } else {
                const newCells = rowCells.filter((cell) => !isCellSelected(cell));
                return [...prev, ...newCells];
            }
        });
    };

    const toggleColumn = (colIndex: number) => {
        const colCells: CellCoordinates[] = [];
        for (let y = 0; y < tray.rows; y++) {
            colCells.push({ x: colIndex, y });
        }
        const allSelected = colCells.every((cell) => isCellSelected(cell));
        setSelectedCells((prev) => {
            if (allSelected) {
                return prev.filter((cell) => cell.x !== colIndex);
            } else {
                const newCells = colCells.filter((cell) => !isCellSelected(cell));
                return [...prev, ...newCells];
            }
        });
    };

    const handleAssignPlant = () => {
        if (selectedCells.length > 0 && selectedPlant) {
            selectedCells.forEach((cell) => {
                assignPlantMutation.mutate({
                    x: cell.x,
                    y: cell.y,
                    plant_id: Number(selectedPlant),
                    planted_date: new Date().toISOString().split("T")[0],
                });
            });
            setSelectedCells([]);
            setSelectedPlant("");
        }
    };

    const handleResetCells = () => {
        if (selectedCells.length > 0) {
            selectedCells.forEach((cell) => {
                resetCellMutation.mutate(cell);
            });
            setSelectedCells([]);
        }
    };

    return (
        <div className="tray-container">
            <h3>{tray.name} Grid</h3>
            <div className="hide-grid-container">
                <button className="grid-toggle-btn" onClick={() => setIsVisible(false)}>
                    Hide Grid
                </button>
            </div>

            {/* Grid container with extra column/row for axis buttons */}
            <div
                className="tray-grid-container"
                style={{
                    display: "grid",
                    gridTemplateColumns: `50px repeat(${tray.columns}, 50px)`,
                    gridTemplateRows: `repeat(${tray.rows}, 50px) 50px`,
                    justifyItems: "center",
                    alignItems: "center",
                }}
            >
                {/* Empty top-left cell */}
                <div style={{ gridColumn: "1", gridRow: "1" }} />
                <AxisButtons tray={tray} formattedGrid={formattedGrid} toggleRow={toggleRow} toggleColumn={toggleColumn} />
                <GridCells formattedGrid={formattedGrid} toggleCell={toggleCell} isCellSelected={isCellSelected} />
            </div>

            {selectedCells.length > 0 && (
                <ControlPanel
                    selectedCells={selectedCells}
                    plants={plants}
                    selectedPlant={selectedPlant}
                    setSelectedPlant={setSelectedPlant}
                    handleAssignPlant={handleAssignPlant}
                    handleResetCells={handleResetCells}
                    clearSelection={() => setSelectedCells([])}
                />
            )}
        </div>
    );
};

export default TrayGrid;
