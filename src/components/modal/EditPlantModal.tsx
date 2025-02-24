import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient, UseMutationResult } from "@tanstack/react-query";
import { fetchPlantById, updatePlant, fetchSpecies } from "@/utils/api";
import { Plant, Species } from "@/typings/types";
import "@/styles/modal/CommonModal.css";

interface EditPlantModalProps {
    plantId: number;
}

const EditPlantModal: React.FC<EditPlantModalProps> = ({ plantId }) => {
    const [isOpen, setIsOpen] = useState(false);
    const queryClient = useQueryClient();

    // ✅ Define form state with correct types
    const [form, setForm] = useState<Plant>({
        id: -1,
        name: "",
        species_id: 0,
        variety: "",
        days_to_germinate: -1,
        days_to_harvest: -1,
    });

    const [isValid, setIsValid] = useState(false);

    // ✅ Form validation: Ensure required fields are filled and numbers are positive
    const isFormValid = () => {
        return (
            form.name.trim() !== "" &&
            form.species_id > 0 &&
            form.variety.trim() !== "" &&
            isPositiveInteger(form.days_to_germinate) &&
            isPositiveInteger(form.days_to_harvest)
        );
    };

    // ✅ Helper function to validate positive integers or undefined
    const isPositiveInteger = (value?: number) => {
        return typeof value === "undefined" || (Number.isInteger(value) && value > 0);
    };

    // ✅ Fetch plant details
    const { data: plant, isLoading } = useQuery<Plant>({
        queryKey: ["plant", plantId],
        queryFn: () => fetchPlantById(plantId),
        enabled: !!plantId,
    });

    // ✅ Fetch species list
    const { data: speciesList } = useQuery<Species[]>({
        queryKey: ["species"],
        queryFn: fetchSpecies,
    });

    // ✅ Update form state when plant data is fetched
    useEffect(() => {
        if (plant) {
            setForm({
                id: plant.id,
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

    // ✅ Mutation to update the plant
    const updatePlantMutation: UseMutationResult<Plant, Error, Plant> = useMutation({
        mutationFn: (updatedPlant) => updatePlant(updatedPlant.id, updatedPlant),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["plant", plantId] });
            queryClient.invalidateQueries({ queryKey: ["plants"] });
            setIsOpen(false);
        },
        onError: (error) => {
            alert(`Failed to update plant: ${error instanceof Error ? error.message : "Unknown error"}`);
        },
    });



    if (!plantId) return null;
    if (isLoading) return <p>Loading plant details...</p>;

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isValid) {
            updatePlantMutation.mutate(form);
        }
    };

    return (
        <div className="modal-open-btn-container">
            <button className={"edit"} onClick={() => setIsOpen(true)}>
                Edit
            </button>

            {isOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Edit Plant</h2>
                        <form className="plant-form" onSubmit={handleSubmit}>
                            <b>Common Name</b>
                            <input
                                type="text"
                                placeholder="Common Name"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                required
                            />

                            <b>Botanical Name</b>
                            <select
                                value={form.species_id}
                                onChange={(e) => setForm({ ...form, species_id: Number(e.target.value) })}
                                required
                            >
                                <option value={-1} disabled>Select Species</option>
                                {speciesList?.map((species) => (
                                    <option key={species.id} value={species.id}>
                                        {species.genus} {species.species}
                                    </option>
                                ))}
                            </select>

                            <b>Cultivar</b>
                            <input
                                type="text"
                                placeholder="Cultivar"
                                value={form.variety}
                                onChange={(e) => setForm({ ...form, variety: e.target.value })}
                                required
                            />

                            <b>Days to Germinate</b>
                            <input
                                type="number"
                                placeholder="Days to Germinate"
                                value={form.days_to_germinate || -1}
                                onChange={(e) =>
                                    setForm({ ...form, days_to_germinate: e.target.value ? Number(e.target.value) : undefined })
                                }
                                required
                            />

                            <b>Days to Harvest</b>
                            <input
                                type="number"
                                placeholder="Days to Harvest"
                                value={form.days_to_harvest || -1}
                                onChange={(e) =>
                                    setForm({ ...form, days_to_harvest: e.target.value ? Number(e.target.value) : undefined })
                                }
                                required
                            />

                            <div className="modal-actions">
                                <button type="submit" className={`primary ${isValid ? "" : "inactive"}`} disabled={!isValid}>
                                    Save Changes
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

export default EditPlantModal;
