import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { fetchTrayGrid, fetchPlants, assignPlantToCell, resetTrayCell } from "../../utils/api";
import "../../styles/TrayGrid.css";

function TrayGrid({ trayId }) {
    const queryClient = useQueryClient();
    const [isVisible, setIsVisible] = useState(false);

    // Fetch tray grid data
    const { data, isLoading, isError } = useQuery({
        queryKey: ["trayGrid", trayId],
        queryFn: () => fetchTrayGrid(trayId),
        enabled: !!trayId && isVisible, // ✅ Only fetch when visible
    });

    // Fetch plant list
    const { data: plants } = useQuery({
        queryKey: ["plants"],
        queryFn: fetchPlants,
    });

    const assignPlantMutation = useMutation({
        mutationFn: ({ x, y, plant_id }) => assignPlantToCell(trayId, { x, y, plant_id }),
        onSuccess: () => queryClient.invalidateQueries(["trayGrid", trayId]),
    });

    const resetCellMutation = useMutation({
        mutationFn: ({ x, y }) => resetTrayCell(trayId, { x, y }),
        onSuccess: () => queryClient.invalidateQueries(["trayGrid", trayId]),
    });

    const [selectedCell, setSelectedCell] = useState(null);
    const [selectedPlant, setSelectedPlant] = useState("");

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

    // Create a plant lookup map for faster access (includes variety)
    const plantMap = (plants || []).reduce((acc, plant) => {
        acc[plant.id] = { name: plant.name, variety: plant.variety };
        return acc;
    }, {});

    // Ensure (0,0) is bottom-left and correctly structured
    const formattedGrid = Array.from({ length: tray.rows }, (_, rowIndex) =>
        Array.from({ length: tray.columns }, (_, colIndex) => {
            const cell = grid.find(cell => cell.x === colIndex && cell.y === rowIndex) || { x: colIndex, y: rowIndex, plant_id: null };
            return {
                ...cell,
                plant_name: cell.plant_id ? plantMap[cell.plant_id]?.name : null,
                variety: cell.plant_id ? plantMap[cell.plant_id]?.variety : null,
            };
        })
    ).reverse();

    const handleAssignPlant = () => {
        if (selectedCell !== null && selectedPlant) {
            assignPlantMutation.mutate({ x: selectedCell.x, y: selectedCell.y, plant_id: selectedPlant });
            setSelectedCell(null);
            setSelectedPlant("");
        }
    };

    const handleResetCell = () => {
        if (selectedCell !== null) {
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
                {formattedGrid.flat().map((cell, index) => (
                    <div
                        key={index}
                        className={`grid-cell ${cell.plant_name ? "occupied" : ""} ${selectedCell && selectedCell.x === cell.x && selectedCell.y === cell.y ? "selected" : ""}`}
                        onClick={() => setSelectedCell({ x: cell.x, y: cell.y, plant_name: cell.plant_name, variety: cell.variety })}
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
                            <select onChange={(e) => setSelectedPlant(e.target.value)} value={selectedPlant}>
                                <option value="">Select Plant</option>
                                {plants
                                    ?.slice()
                                    .sort((a, b) => {
                                        const nameComparison = a.name.localeCompare(b.name);
                                        return nameComparison !== 0 ? nameComparison : a.variety.localeCompare(b.variety);
                                    })
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
}

export default TrayGrid;
