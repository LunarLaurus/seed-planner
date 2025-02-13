import { useQuery, useMutation, useQueryClient, UseMutationResult } from "@tanstack/react-query";
import { useState } from "react";
import { fetchTrayGrid, fetchPlants, assignPlantToCell, resetTrayCell } from "../../utils/api";
import "../../styles/TrayGrid.css";
import { TrayCell, Tray, Plant, Cell, CellCoordinates } from "@/typings/types";

interface TrayGridProps {
    trayId: number;
}

// Extended type for displaying grid cells
interface DisplayCell extends TrayCell {
    plant_name?: string | null;
    variety?: string | null;
}

const TrayGrid: React.FC<TrayGridProps> = ({ trayId }) => {
    const queryClient = useQueryClient();
    const [isVisible, setIsVisible] = useState(false);
    const [selectedCell, setSelectedCell] = useState<DisplayCell | null>(null);
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

    // Mutation: Assign plant to cell
    const assignPlantMutation: UseMutationResult<void, unknown, Cell> = useMutation({
        mutationFn: ({ x, y, plant_id }) => assignPlantToCell(trayId, { x, y, plant_id }),
        onSuccess: () => queryClient.invalidateQueries(["trayGrid", trayId]),
    });

    // Mutation: Reset cell
    const resetCellMutation: UseMutationResult<void, unknown, CellCoordinates> = useMutation({
        mutationFn: ({ x, y }) => resetTrayCell(trayId, { x, y }),
        onSuccess: () => queryClient.invalidateQueries(["trayGrid", trayId]),
    });

    if (!isVisible) {
        return (
            <div className="tray-hidden">
                <button className="grid-toggle-btn" onClick={() => setIsVisible(true)}>Show Grid</button>
            </div>
        );
    }

    if (isLoading) return <p>Loading tray grid...</p>;
    if (isError || !data || !data.tray) return <p>Error loading tray grid.</p>;

    const { tray, grid } = data;

    // Create a plant lookup map for fast access
    const plantMap = new Map<number, { name: string; variety: string }>(
        plants?.map((p) => [p.id, { name: p.name, variety: p.variety }]) || []
    );

    // Format grid (0,0) at bottom-left
    const formattedGrid: DisplayCell[][] = Array.from({ length: tray.rows }, (_, rowIndex) =>
        Array.from({ length: tray.columns }, (_, colIndex) => {
            const cell = grid.find((c) => c.x === colIndex && c.y === rowIndex) || { id: 0, tray_id: tray.id, x: colIndex, y: rowIndex, plant_id: null, planted_date: "" };
            return {
                ...cell,
                plant_name: cell.plant_id ? plantMap.get(cell.plant_id)?.name || null : null,
                variety: cell.plant_id ? plantMap.get(cell.plant_id)?.variety || null : null,
            };
        })
    ).reverse();

    const handleAssignPlant = () => {
        if (selectedCell && selectedPlant) {
            assignPlantMutation.mutate({ x: selectedCell.x, y: selectedCell.y, plant_id: Number(selectedPlant), planted_date: new Date().toISOString().split("T")[0] });
            setSelectedCell(null);
            setSelectedPlant("");
        }
    };

    const handleResetCell = () => {
        if (selectedCell) {
            resetCellMutation.mutate({ x: selectedCell.x, y: selectedCell.y });
            setSelectedCell(null);
        }
    };

    return (
        <div className="tray-container">
            <h3>{tray.name} Grid</h3>

            <div className="hide-grid-container">
                <button className="grid-toggle-btn" onClick={() => setIsVisible(false)}>Hide Grid</button>
            </div>

            <div
                className="tray-grid"
                style={{
                    gridTemplateColumns: `repeat(${tray.columns}, 50px)`,
                    gridTemplateRows: `repeat(${tray.rows}, 50px)`,
                }}
            >
                {formattedGrid.flat().map((cell) => (
                    <div
                        key={`${cell.x}-${cell.y}`}
                        className={`grid-cell ${cell.plant_name ? "occupied" : ""} ${
                            selectedCell && selectedCell.x === cell.x && selectedCell.y === cell.y ? "selected" : ""
                        }`}
                        onClick={() => setSelectedCell(cell)}
                    >
                        {cell.plant_name ? cell.plant_name : "-"}
                    </div>
                ))}
            </div>

            {selectedCell && (
                <div className="cell-control">
                    <h4>Manage Cell ({selectedCell.x}, {selectedCell.y})</h4>

                    {selectedCell.plant_name ? (
                        <>
                            <p>Currently assigned: <strong>{selectedCell.variety}</strong></p>
                            <button className="reset" onClick={handleResetCell}>Reset Cell</button>
                        </>
                    ) : (
                        <>
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
                            <button onClick={handleAssignPlant}>Assign</button>
                        </>
                    )}

                    <button className="cancel" onClick={() => setSelectedCell(null)}>Cancel</button>
                </div>
            )}
        </div>
    );
};

export default TrayGrid;
