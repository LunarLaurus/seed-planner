import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchTrayById, updateTray } from "../../utils/api";
import "../../styles/modal/CommonModal.css";

function EditTrayModal({ trayId, onClose }) {
    const queryClient = useQueryClient();
    const [form, setForm] = useState({
        name: "",
        location: "",
        rows: "",
        columns: "",
        notes: "",
    });

    const [isValid, setIsValid] = useState(false); // ✅ Track form validity in state

    // ✅ Ensure all required fields are filled and numbers are valid
    const isFormValid = () => {
        return (
            form.name.trim() !== "" &&
            form.location.trim() !== "" &&
            isPositiveInteger(form.rows) &&
            isPositiveInteger(form.columns)
        );
    };

    // ✅ Helper function to validate positive integers
    const isPositiveInteger = (value) => {
        const num = Number(value);
        return Number.isInteger(num) && num > 0;
    };

    // Fetch tray details
    const { data: tray, isLoading } = useQuery({
        queryKey: ["tray", trayId],
        queryFn: () => fetchTrayById(trayId),
        enabled: !!trayId, // Only fetch when trayId is provided
    });

    // ✅ Update form state when tray data is fetched
    useEffect(() => {
        if (tray) {
            setForm({
                name: tray.name,
                location: tray.location,
                rows: tray.rows || 0,
                columns: tray.columns || 0,
                notes: tray.notes || "",
            });
        }
    }, [tray]);

    // ✅ Update form validation state when form changes
    useEffect(() => {
        setIsValid(isFormValid());
    }, [form]);

    // Mutation to update the tray
    const updateTrayMutation = useMutation({
        mutationFn: (updatedTray) => updateTray(trayId, updatedTray),
        onSuccess: () => {
            queryClient.invalidateQueries(["tray", trayId]);
            queryClient.invalidateQueries(["trays"]);
            onClose(); // Close modal on success
        },
        onError: (error) => alert(`Failed to update tray: ${error.message}`),
    });

    if (!trayId) return null;
    if (isLoading) return <p>Loading tray details...</p>;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isValid) {
            updateTrayMutation.mutate({
                ...form,
                rows: parseInt(form.rows) || 0,
                columns: parseInt(form.columns) || 0,
            });
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Edit Tray</h2>
                <form className="tray-form" onSubmit={handleSubmit}>
                    <b>Tray Name</b>
                    <input type="text" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />

                    <b>Tray Location</b>
                    <input type="text" placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />

                    <b>Rows</b>
                    <input type="number" placeholder="Rows" value={form.rows} onChange={(e) => setForm({ ...form, rows: parseInt(e.target.value) || 0 })} required />

                    <b>Columns</b>
                    <input type="number" placeholder="Columns" value={form.columns} onChange={(e) => setForm({ ...form, columns: parseInt(e.target.value) || 0 })} required />

                    <b>Notes</b>
                    <input type="text" placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />

                    <div className="modal-actions">
                        <button type="submit" className={`primary ${isValid ? "" : "inactive"}`} disabled={!isValid}>Save Changes</button>
                        <button type="button" className="cancel" onClick={onClose}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditTrayModal;
