import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchTrayById, updateTray } from "../../utils/api";
import "../../styles/Forms.css";

function EditTray() {
    const { trayId } = useParams();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    // Fetch existing tray details
    const { data: tray, isLoading } = useQuery({
        queryKey: ["tray", trayId],
        queryFn: () => fetchTrayById(trayId),
        enabled: !!trayId,
    });

    // Mutation to update tray details
    const updateTrayMutation = useMutation({
        mutationFn: (updatedTray) => updateTray(trayId, updatedTray),
        onSuccess: () => {
            queryClient.invalidateQueries(["tray", trayId]);
            queryClient.invalidateQueries(["trays"]);
            navigate("/trays");
        },
    });

    // Form state, initialized with default empty values
    const [form, setForm] = useState({ name: "", location: "", rows: "", columns: "", notes: "" });

    // Update form state when tray data loads
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

    if (isLoading) return <p>Loading tray details...</p>;

    const handleSubmit = (e) => {
        e.preventDefault();
        updateTrayMutation.mutate({
            ...form,
            rows: parseInt(form.rows) || 0, // Ensure numbers
            columns: parseInt(form.columns) || 0, // Ensure numbers
        });
    };

    return (
        <div className="page-container">
            <div className="content-container">
                <h1>Edit Tray</h1>
                <form onSubmit={handleSubmit}>
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
                        value={form.rows}
                        onChange={(e) => setForm({ ...form, rows: parseInt(e.target.value) || 0 })}
                        required
                    />

                    <b>Columns</b>
                    <input
                        type="number"
                        placeholder="Columns"
                        value={form.columns}
                        onChange={(e) => setForm({ ...form, columns: parseInt(e.target.value) || 0 })}
                        required
                    />

                    <b>Notes</b>
                    <input
                        type="text"
                        placeholder="Notes"
                        value={form.notes}
                        onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    />

                    <button className="primary" type="submit">Save</button>
                </form>
            </div>
        </div>
    );
}

export default EditTray;
