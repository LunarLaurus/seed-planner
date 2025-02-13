import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { addPlant } from "../../utils/api";
import "../../styles/modal/CommonModal.css";

function NewPlantModal({ speciesList, queryClient }) {
    const [isOpen, setIsOpen] = useState(false);
    const [newPlant, setNewPlant] = useState({
        name: "",
        species_id: "",
        variety: "",
        days_to_germinate: "",
        days_to_harvest: "",
    });

    // Mutation to add a new plant to the database
    const addPlantMutation = useMutation({
        mutationFn: addPlant,
        onSuccess: () => {
            queryClient.invalidateQueries(["plants"]);
            setNewPlant({ name: "", species_id: "", variety: "", days_to_germinate: "", days_to_harvest: "" }); // Reset form fields after successful submission
            setIsOpen(false); // Close modal on success
        },
        onError: (error) => alert(`Failed to add plant: ${error.message}`),
    });

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        if (isFormValid()) {
            addPlantMutation.mutate(newPlant); // Trigger the mutation with the current form data
        }
    };

    // Ensure all required fields are filled before enabling the submit button
    const isFormValid = () => {
        return (
            Object.values(newPlant).every(value => value !== "") && // Ensure no empty fields
            isPositiveInteger(newPlant.days_to_germinate) &&
            isPositiveInteger(newPlant.days_to_harvest)
        );
    };
    
    // Helper function to check if a value is a positive integer
    const isPositiveInteger = (value) => {
        return Number.isInteger(Number(value)) && Number(value) > 0;
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
                                onChange={(e) => setNewPlant({ ...newPlant, species_id: e.target.value })}
                                required
                            >
                                <option value="" disabled>Select Species</option>
                                {speciesList?.map(species => (
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
                                value={newPlant.days_to_germinate}
                                onChange={(e) => setNewPlant({ ...newPlant, days_to_germinate: parseInt(e.target.value) || "" })}
                                required
                            />
                            <input
                                type="number"
                                placeholder="Days to Harvest"
                                value={newPlant.days_to_harvest}
                                onChange={(e) => setNewPlant({ ...newPlant, days_to_harvest: parseInt(e.target.value) || "" })}
                                required
                            />

                            <div className="modal-actions">
                                <button
                                    type="submit"
                                    className={`primary ${isFormValid() ? "" : "inactive"}`}
                                    disabled={!isFormValid()}
                                >
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
}

export default NewPlantModal;
