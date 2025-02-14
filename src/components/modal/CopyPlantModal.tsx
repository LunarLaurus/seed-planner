import { useState } from "react";
import { useQueryClient, useMutation, UseMutationResult } from "@tanstack/react-query";
import { addPlant } from "@/utils/api";
import { Plant } from "@/typings/types";
import "@/styles/modal/CommonModal.css";

interface CopyPlantModalProps {
    copyPlant: Plant;
}

/**
 * CopyPlantModal allows users to create a new plant by copying an existing plant's data.
 * The modal is pre-filled with the existing plant's data (except the id) and calls addPlant on submission.
 */
const CopyPlantModal: React.FC<CopyPlantModalProps> = ({ copyPlant }) => {
    const [isOpen, setIsOpen] = useState(false);
    // Manage modal open/close state.
    const queryClient = useQueryClient();

    // Initialize newPlant state with a copy of the provided plant, resetting its id.
    const [newPlant, setNewPlant] = useState<Plant>({ ...copyPlant, id: 0 });

    // Mutation to add a new plant.
    const addPlantMutation: UseMutationResult<Plant, Error, Plant> = useMutation({
        mutationFn: addPlant,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["plants"] });
            // Reset the form state using the initial copy.
            setNewPlant({ ...copyPlant, id: 0 });
            setIsOpen(false);
        },
        onError: (error: Error) => alert(`Failed to add plant: ${error.message}`),
    });

    /**
     * Handles the form submission.
     * Calls the addPlant mutation if the form is valid.
     */
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isFormValid()) {
            addPlantMutation.mutate(newPlant);
        }
    };

    /**
     * Validates the form ensuring all required fields are filled.
     * @returns {boolean} True if form is valid.
     */
    const isFormValid = (): boolean => {
        return (
            newPlant.name.trim() !== "" &&
            newPlant.species_id > 0 &&
            newPlant.variety.trim() !== "" &&
            isPositiveInteger(newPlant.days_to_germinate) &&
            isPositiveInteger(newPlant.days_to_harvest)
        );
    };

    /**
     * Helper function to check if a value is a positive integer.
     * @param value The value to check.
     * @returns {boolean} True if value is undefined or a positive integer.
     */
    const isPositiveInteger = (value?: number): boolean => {
        return typeof value === "undefined" || (Number.isInteger(value) && value > 0);
    };

    return (
        <div className="modal-open-btn-container">
            <button className={"copy"} onClick={() => setIsOpen(true)}>
                Copy
            </button>

            {isOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Copy Plant</h2>
                        <form className="plant-form" onSubmit={handleSubmit}>
                            <b>Cultivar</b>
                            <input
                                type="text"
                                placeholder="Cultivar"
                                value={newPlant.variety}
                                onChange={(e) => setNewPlant({ ...newPlant, variety: e.target.value })}
                                required
                            />
                            <b>Days to Germinate</b>
                            <input
                                type="number"
                                placeholder="Days to Germinate"
                                value={newPlant.days_to_germinate ?? ""}
                                onChange={(e) =>
                                    setNewPlant({
                                        ...newPlant,
                                        days_to_germinate: Number(e.target.value) || undefined,
                                    })
                                }
                                required
                            />
                            <b>Days to Harvest</b>
                            <input
                                type="number"
                                placeholder="Days to Harvest"
                                value={newPlant.days_to_harvest ?? ""}
                                onChange={(e) =>
                                    setNewPlant({
                                        ...newPlant,
                                        days_to_harvest: Number(e.target.value) || undefined,
                                    })
                                }
                                required
                            />

                            <div className="modal-actions">
                                <button type="submit" className={`primary ${isFormValid() ? "" : "inactive"}`} disabled={!isFormValid()}>
                                    Add Plant
                                </button>
                                <button type="button" className="cancel" onClick={() => setIsOpen(false)}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CopyPlantModal;
