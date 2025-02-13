import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { addSpecies } from "../../utils/api";
import ClosableFormWrapper from "./ClosableFormWrapper";

function SpeciesForm({ queryClient }) {
    const [newSpecies, setNewSpecies] = useState({ genus: "", species: "" });

    // Mutation to add a species
    const addSpeciesMutation = useMutation({
        mutationFn: addSpecies,
        onSuccess: () => queryClient.invalidateQueries(["species"]),
        onError: (error) => alert(`Failed to add species: ${error.message}`),
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        addSpeciesMutation.mutate(newSpecies);
        setNewSpecies({ genus: "", species: "" }); // Reset form
    };

    return (
        <ClosableFormWrapper title="Add New Species">
            <form className="species-form" onSubmit={handleSubmit}>
                <input type="text" placeholder="Genus" value={newSpecies.genus} onChange={(e) => setNewSpecies({ ...newSpecies, genus: e.target.value })} required />
                <input type="text" placeholder="Species" value={newSpecies.species} onChange={(e) => setNewSpecies({ ...newSpecies, species: e.target.value })} required />
                <button type="submit" className="primary">Add Species</button>
            </form>
        </ClosableFormWrapper>
    );
}

export default SpeciesForm;
