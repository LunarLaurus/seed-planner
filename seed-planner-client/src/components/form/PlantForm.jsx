import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { addPlant } from "../../utils/api";
import ClosableFormWrapper from "./ClosableFormWrapper";

function PlantForm({ speciesList, queryClient }) {

    const [newPlant, setNewPlant] = useState({ name: "", species_id: "", variety: "", days_to_germinate: "", days_to_harvest: "" });

    // Mutation to add a plant
    const addPlantMutation = useMutation({
        mutationFn: addPlant,
        onSuccess: () => queryClient.invalidateQueries(["plants"]),
        onError: (error) => alert(`Failed to add plant: ${error.message}`),
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        addPlantMutation.mutate(newPlant);
        setNewPlant({ name: "", species_id: "", variety: "", days_to_germinate: "", days_to_harvest: "" }); // Reset form
    };

    return (
        <ClosableFormWrapper title="Add New Plant">
            <form className="plant-form" onSubmit={handleSubmit}>
                <input type="text" placeholder="Common Name" value={newPlant.name} onChange={(e) => setNewPlant({ ...newPlant, name: e.target.value })} required />

                <select value={newPlant.species_id} onChange={(e) => setNewPlant({ ...newPlant, species_id: e.target.value })} required>
                    <option value="" disabled>Select Species</option>
                    {speciesList?.map(species => (
                        <option key={species.id} value={species.id}>
                            {species.genus} {species.species}
                        </option>
                    ))}
                </select>

                <input type="text" placeholder="Cultivar" value={newPlant.variety} onChange={(e) => setNewPlant({ ...newPlant, variety: e.target.value })} required />
                <input type="number" placeholder="Days to Germinate" value={newPlant.days_to_germinate} onChange={(e) => setNewPlant({ ...newPlant, days_to_germinate: parseInt(e.target.value) || "" })} required />
                <input type="number" placeholder="Days to Harvest" value={newPlant.days_to_harvest} onChange={(e) => setNewPlant({ ...newPlant, days_to_harvest: parseInt(e.target.value) || "" })} required />

                <button type="submit" className="primary">Add Plant</button>
            </form>
        </ClosableFormWrapper>
    );
}

export default PlantForm;
