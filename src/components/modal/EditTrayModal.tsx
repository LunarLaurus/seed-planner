import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient, UseMutationResult } from "@tanstack/react-query";
import { fetchTrayById, updateTray } from "../../utils/api";
import { Tray } from "@/typings/types";
import "../../styles/modal/CommonModal.css";

interface EditTrayModalProps {
    trayId: number;
    onClose: () => void;
}

const EditTrayModal: React.FC<EditTrayModalProps> = ({ trayId, onClose }) => {
    const queryClient = useQueryClient();

    // ✅ Define form state with correct types
    const [form, setForm] = useState<Tray>({
        id: -1,
        name: "",
        location: "",
        rows: 0,
        columns: 0,
        notes: "",
    });

    const [isValid, setIsValid] = useState(false);

    // ✅ Form validation: Ensure required fields are filled and numbers are valid
    const isFormValid = (): boolean => {
        return (
            form.name.trim() !== "" &&
            form.location.trim() !== "" &&
            isPositiveInteger(form.rows) &&
            isPositiveInteger(form.columns)
        );
    };

    // ✅ Helper function to validate positive integers
    const isPositiveInteger = (value: number): boolean => {
        return Number.isInteger(value) && value > 0;
    };

    // ✅ Fetch tray details
    const { data: tray, isLoading } = useQuery<Tray>({
        queryKey: ["tray", trayId],
        queryFn: () => fetchTrayById(trayId),
        enabled: !!trayId, // Only fetch when trayId is provided
    });

    // ✅ Update form state when tray data is fetched
    useEffect(() => {
        if (tray) {
            setForm({
                id: tray.id,
                name: tray.name,
                location: tray.location,
                rows: tray.rows || 0,
                columns: tray.columns || 0,
                notes: tray.notes || "",
            });
        }
    }, [tray]);

    useEffect(() => {
        setIsValid(isFormValid());
    }, [form]);

    const updateTrayMutation: UseMutationResult<Tray, Error, Tray> = useMutation({
        mutationFn: (updatedTray) => updateTray(trayId, updatedTray),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tray", trayId] });
            queryClient.invalidateQueries({ queryKey: ["trays"] });
            onClose(); // Close modal on success
        },
        onError: (error: any) => alert(`Failed to update tray: ${error.message}`),
    });

    if (!trayId) return null;
    if (isLoading) return <p>Loading tray details...</p>;

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isValid) {
            updateTrayMutation.mutate(form);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Edit Tray</h2>
                <form className="tray-form" onSubmit={handleSubmit}>
                    <b>Tray Name</b>
                    <input
                        type="text"
                        placeholder="Name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                    />

                    <b>Tray Location</b>
                    <input
                        type="text"
                        placeholder="Location"
                        value={form.location}
                        onChange={(e) => setForm({ ...form, location: e.target.value })}
                        required
                    />

                    <b>Rows</b>
                    <input
                        type="number"
                        placeholder="Rows"
                        value={form.rows || -1}
                        onChange={(e) =>
                            setForm({ ...form, rows: e.target.value ? Number(e.target.value) : 0 })
                        }
                        required
                    />

                    <b>Columns</b>
                    <input
                        type="number"
                        placeholder="Columns"
                        value={form.columns || -1}
                        onChange={(e) =>
                            setForm({ ...form, columns: e.target.value ? Number(e.target.value) : 0 })
                        }
                        required
                    />

                    <b>Notes</b>
                    <input
                        type="text"
                        placeholder="Notes"
                        value={form.notes}
                        onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    />

                    <div className="modal-actions">
                        <button type="submit" className={`primary ${isValid ? "" : "inactive"}`} disabled={!isValid}>
                            Save Changes
                        </button>
                        <button type="button" className="cancel" onClick={onClose}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditTrayModal;