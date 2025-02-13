import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { addSpecies } from "../../utils/api";
import "../../styles/modal/CommonModal.css";

function NewSpeciesModal({ queryClient }) {
    const [isOpen, setIsOpen] = useState(false);
    const [newSpecies, setNewSpecies] = useState({ genus: "", species: "" });

    // Mutation to add a new species to the database
    const addSpeciesMutation = useMutation({
        mutationFn: addSpecies,
        onSuccess: () => {
            queryClient.invalidateQueries(["species"]);
            setNewSpecies({ genus: "", species: "" }); // Reset form fields after successful submission
            setIsOpen(false); // Close modal on success
        },
        onError: (error) => alert(`Failed to add species: ${error.message}`),
    });

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        if (isFormValid()) {
            addSpeciesMutation.mutate(newSpecies); // Trigger the mutation with the current form data
        }
    };

    // Ensure both fields are filled before enabling the submit button
    const isFormValid = () => Object.values(newSpecies).every(value => value !== "");

    return (
        <div className="modal-open-btn-container">
            <button className="modal-open-btn" onClick={() => setIsOpen(true)}>Add New Species</button>

            {isOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Add New Species</h2>
                        <form className="species-form" onSubmit={handleSubmit}>
                            <input
                                type="text"
                                placeholder="Genus"
                                value={newSpecies.genus}
                                onChange={(e) => setNewSpecies({ ...newSpecies, genus: e.target.value })}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Species"
                                value={newSpecies.species}
                                onChange={(e) => setNewSpecies({ ...newSpecies, species: e.target.value })}
                                required
                            />

                            <div className="modal-actions">
                                <button
                                    type="submit"
                                    className={`primary ${isFormValid() ? "" : "inactive"}`}
                                    disabled={!isFormValid()}
                                >
                                    Add Species
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

export default NewSpeciesModal;
