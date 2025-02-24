import { useState } from "react";
import { useQueryClient, useMutation, UseMutationResult } from "@tanstack/react-query";
import { addSpecies } from "@/utils/api";
import { Species } from "@/typings/types";
import "@/styles/modal/CommonModal.css";

interface CopySpeciesModalProps {
    copySpecies: Species;
}

/**
 * CopySpeciesModal allows users to create a new species by copying an existing species' data.
 * The modal is pre-filled with the existing species' data (with id reset to 0) and calls addSpecies on submission.
 */
const CopySpeciesModal: React.FC<CopySpeciesModalProps> = ({ copySpecies }) => {
    const [isOpen, setIsOpen] = useState(false);
    const queryClient = useQueryClient();

    // Initialize newSpecies with a copy of the provided species data, resetting the id.
    const [newSpecies, setNewSpecies] = useState<Species>({ ...copySpecies, id: 0 });

    // Mutation to add a new species.
    const addSpeciesMutation: UseMutationResult<Species, Error, Species> = useMutation({
        mutationFn: addSpecies,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["species"] });
            // Reset the form state using the initial copy.
            setNewSpecies({ ...copySpecies, id: 0 });
            setIsOpen(false);
        },
        onError: (error: Error) => alert(`Failed to add species: ${error.message}`),
    });

    /**
     * Handles the form submission by calling the addSpecies mutation if the form is valid.
     */
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isFormValid()) {
            addSpeciesMutation.mutate(newSpecies);
        }
    };

    /**
     * Validates the form ensuring that both genus and species fields are non-empty.
     * @returns {boolean} True if the form is valid.
     */
    const isFormValid = (): boolean => {
        return newSpecies.genus.trim() !== "" && newSpecies.species.trim() !== "";
    };

    return (
        <div className="modal-open-btn-container">
            <button className="copy" onClick={() => setIsOpen(true)}>
                Copy
            </button>

            {isOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Copy Genus</h2>
                        <h2>Add New Species</h2>
                        <form className="species-form" onSubmit={handleSubmit}>
                            <b>Species</b>
                            <input
                                type="text"
                                placeholder="New Species"
                                value={newSpecies.species}
                                onChange={(e) => setNewSpecies({ ...newSpecies, species: e.target.value.toLowerCase() })}
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

export default CopySpeciesModal;
