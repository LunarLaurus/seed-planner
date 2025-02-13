import { useState } from "react";
import { QueryClient, useMutation, UseMutationResult } from "@tanstack/react-query";
import { addPlant } from "@/utils/api";
import { Species, Plant } from "@/typings/types";
import "@/styles/modal/CommonModal.css";

interface NewPlantModalProps {
    speciesList: Species[];
    queryClient: QueryClient;
}

const NewPlantModal: React.FC<NewPlantModalProps> = ({ speciesList, queryClient }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [newPlant, setNewPlant] = useState<Plant>({
        id: -1,
        name: "",
        species_id: 0,
        variety: "",
        days_to_germinate: undefined,
        days_to_harvest: undefined,
    });

    // Mutation to add a new plant
    const addPlantMutation: UseMutationResult<Plant, Error, Plant> = useMutation({
        mutationFn: addPlant,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["plants"] });
            setNewPlant({ id: 0, name: "", species_id: 0, variety: "", days_to_germinate: undefined, days_to_harvest: undefined });
            setIsOpen(false);
        },
        onError: (error: any) => alert(`Failed to add plant: ${error.message}`),
    });

    // Handle form submission
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isFormValid()) {
            addPlantMutation.mutate(newPlant);
        }
    };

    // Ensure all required fields are filled before enabling the submit button
    const isFormValid = (): boolean => {
        return (
            newPlant.name.trim() !== "" &&
            newPlant.species_id > 0 &&
            newPlant.variety.trim() !== "" &&
            isPositiveInteger(newPlant.days_to_germinate) &&
            isPositiveInteger(newPlant.days_to_harvest)
        );
    };

    // Helper function to check if a value is a positive integer
    const isPositiveInteger = (value?: number): boolean => {
        return typeof value === "undefined" || (Number.isInteger(value) && value > 0);
    };

    return (
        <div className="modal-open-btn-container">
            <button className="modal-open-btn" onClick={() => setIsOpen(true)}>Add New Plant</button>

            {isOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Add New Plant</h2>
                        <form className="plant-form" onSubmit={handleSubmit}>
                            <input
                                type="text"
                                placeholder="Common Name"
                                value={newPlant.name}
                                onChange={(e) => setNewPlant({ ...newPlant, name: e.target.value })}
                                required
                            />
                            <select
                                value={newPlant.species_id}
                                onChange={(e) => setNewPlant({ ...newPlant, species_id: Number(e.target.value) })}
                                required
                            >
                                <option value="" disabled>Select Species</option>
                                {speciesList?.map((species) => (
                                    <option key={species.id} value={species.id}>
                                        {species.genus} {species.species}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="text"
                                placeholder="Cultivar"
                                value={newPlant.variety}
                                onChange={(e) => setNewPlant({ ...newPlant, variety: e.target.value })}
                                required
                            />
                            <input
                                type="number"
                                placeholder="Days to Germinate"
                                value={newPlant.days_to_germinate || ""}
                                onChange={(e) => setNewPlant({ ...newPlant, days_to_germinate: Number(e.target.value) || undefined })}
                                required
                            />
                            <input
                                type="number"
                                placeholder="Days to Harvest"
                                value={newPlant.days_to_harvest || ""}
                                onChange={(e) => setNewPlant({ ...newPlant, days_to_harvest: Number(e.target.value) || undefined })}
                                required
                            />

                            <div className="modal-actions">
                                <button type="submit" className={`primary ${isFormValid() ? "" : "inactive"}`} disabled={!isFormValid()}>
                                    Add Plant
                                </button>
                                <button type="button" className="cancel" onClick={() => setIsOpen(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NewPlantModal;
