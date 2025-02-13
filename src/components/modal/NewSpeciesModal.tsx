import { useState } from "react";
import { QueryClient, useMutation } from "@tanstack/react-query";
import { addSpecies } from "../../utils/api";
import "../../styles/modal/CommonModal.css";
import { Species } from "@/typings/types"; // ✅ Corrected import

interface NewSpeciesModalProps {
    queryClient: QueryClient;
}

const NewSpeciesModal: React.FC<NewSpeciesModalProps> = ({ queryClient }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [newSpecies, setNewSpecies] = useState<Species>({
        id: 0,
        genus: "",
        species: "",
    });

    // Mutation to add a new species
    const addSpeciesMutation = useMutation({
        mutationFn: addSpecies,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["species"] });
            setNewSpecies({ id: 0, genus: "", species: "" }); // ✅ Reset after success
            setIsOpen(false);
        },
        onError: (error: any) => alert(`Failed to add species: ${error.message}`),
    });

    // Handle form submission
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isFormValid()) {
            addSpeciesMutation.mutate(newSpecies);
        }
    };

    // Check if form is valid
    const isFormValid = () => newSpecies.genus.trim() !== "" && newSpecies.species.trim() !== "";

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
};

export default NewSpeciesModal;
