import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchPlantById, updatePlant, fetchSpecies } from "../../utils/api";
import "../../styles/Forms.css";

function EditPlant() {
    const { plantId } = useParams();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    // Fetch plant details
    const { data: plant, isLoading } = useQuery({
        queryKey: ["plant", plantId],
        queryFn: () => fetchPlantById(plantId),
        enabled: !!plantId,
    });

    // Fetch species list
    const { data: speciesList } = useQuery({
        queryKey: ["species"],
        queryFn: fetchSpecies,
    });

    // Mutation to update the plant
    const updatePlantMutation = useMutation({
        mutationFn: (updatedPlant) => updatePlant(plantId, updatedPlant),
        onSuccess: () => {
            queryClient.invalidateQueries(["plant", plantId]);
            queryClient.invalidateQueries(["plants"]);
            navigate("/plants");
        },
        onError: (error) => alert(`Failed to update plant: ${error.message}`),
    });

    // Form state
    const [form, setForm] = useState({
        name: "",
        species_id: "", // New species selection
        variety: "",
        days_to_germinate: "",
        days_to_harvest: "",
    });

    useEffect(() => {
        if (plant) {
            setForm({
                name: plant.name,
                species_id: plant.species_id, // Default to current species
                variety: plant.variety,
                days_to_germinate: plant.days_to_germinate,
                days_to_harvest: plant.days_to_harvest,
            });
        }
    }, [plant]);

    if (isLoading) return <p>Loading plant details...</p>;

    const handleSubmit = (e) => {
        e.preventDefault();
        updatePlantMutation.mutate(form);
    };

    return (
        <div className="page-container">
            <div className="content-container">
                <h1>Edit Plant</h1>
                <form onSubmit={handleSubmit}>
                    <b>Common Name</b>
                    <input
                        type="text"
                        placeholder="Common Name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                    />

                    <b>Species</b>
                    <select
                        value={form.species_id}
                        onChange={(e) => setForm({ ...form, species_id: e.target.value })}
                        required
                    >
                        <option value="" disabled>Select Species</option>
                        {speciesList?.map(species => (
                            <option key={species.id} value={species.id}>
                                {species.genus} {species.species}
                            </option>
                        ))}
                    </select>

                    <b>Cultivar</b>
                    <input
                        type="text"
                        placeholder="Variety"
                        value={form.variety}
                        onChange={(e) => setForm({ ...form, variety: e.target.value })}
                        required
                    />

                    <b>Days to Germinate</b>
                    <input
                        type="number"
                        placeholder="Days to Germinate"
                        value={form.days_to_germinate}
                        onChange={(e) => setForm({ ...form, days_to_germinate: e.target.value })}
                        required
                    />

                    <b>Days to Harvest</b>
                    <input
                        type="number"
                        placeholder="Days to Harvest"
                        value={form.days_to_harvest}
                        onChange={(e) => setForm({ ...form, days_to_harvest: e.target.value })}
                        required
                    />

                    <button className="primary" type="submit">Save</button>
                </form>
            </div>
        </div>
    );
}

export default EditPlant;
