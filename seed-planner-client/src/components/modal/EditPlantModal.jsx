import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchPlantById, updatePlant, fetchSpecies } from "../../utils/api";
import "../../styles/modal/CommonModal.css";

function EditPlantModal({ plantId, onClose }) {
    const queryClient = useQueryClient();
    const [form, setForm] = useState({
        name: "",
        species_id: "",
        variety: "",
        days_to_germinate: "",
        days_to_harvest: "",
    });

    const [isValid, setIsValid] = useState(false); // ✅ Track form validity in state

    // ✅ Ensure all required fields are filled and numbers are positive
    const isFormValid = () => {
        return (
            form.name.trim() !== "" &&
            form.species_id !== "" &&
            form.variety.trim() !== "" &&
            isPositiveInteger(form.days_to_germinate) &&
            isPositiveInteger(form.days_to_harvest)
        );
    };

    // ✅ Helper function to validate positive integers
    const isPositiveInteger = (value) => {
        const num = Number(value);
        return Number.isInteger(num) && num > 0;
    };

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

    // ✅ Update form state when plant data is fetched
    useEffect(() => {
        if (plant) {
            setForm({
                name: plant.name,
                species_id: plant.species_id,
                variety: plant.variety,
                days_to_germinate: plant.days_to_germinate,
                days_to_harvest: plant.days_to_harvest,
            });
        }
    }, [plant]);

    // ✅ Update form validation state when form changes
    useEffect(() => {
        setIsValid(isFormValid());
    }, [form]);

    // Mutation to update the plant
    const updatePlantMutation = useMutation({
        mutationFn: (updatedPlant) => updatePlant(plantId, updatedPlant),
        onSuccess: () => {
            queryClient.invalidateQueries(["plant", plantId]);
            queryClient.invalidateQueries(["plants"]);
            onClose(); // Close modal on success
        },
        onError: (error) => alert(`Failed to update plant: ${error.message}`),
    });

    if (!plantId) return null;
    if (isLoading) return <p>Loading plant details...</p>;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isValid) {
            updatePlantMutation.mutate(form);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Edit Plant</h2>
                <form className="plant-form" onSubmit={handleSubmit}>
                    <b>Common Name</b>
                    <input type="text" placeholder="Common Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />

                    <b>Botanical Name</b>
                    <select value={form.species_id} onChange={(e) => setForm({ ...form, species_id: e.target.value })} required>
                        <option value="" disabled>Select Species</option>
                        {speciesList?.map(species => (
                            <option key={species.id} value={species.id}>
                                {species.genus} {species.species}
                            </option>
                        ))}
                    </select>

                    <b>Cultivar</b>
                    <input type="text" placeholder="Cultivar" value={form.variety} onChange={(e) => setForm({ ...form, variety: e.target.value })} required />
                    
                    <b>Days to Germinate</b>
                    <input type="number" placeholder="Days to Germinate" value={form.days_to_germinate} onChange={(e) => setForm({ ...form, days_to_germinate: parseInt(e.target.value) || "" })} required />
                    
                    <b>Days to Harvest</b>
                    <input type="number" placeholder="Days to Harvest" value={form.days_to_harvest} onChange={(e) => setForm({ ...form, days_to_harvest: parseInt(e.target.value) || "" })} required />

                    <div className="modal-actions">
                        <button type="submit" className={`primary ${isValid ? "" : "inactive"}`} disabled={!isValid}>Save Changes</button>
                        <button type="button" className="cancel" onClick={onClose}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditPlantModal;
