import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { addTray } from "../../utils/api";
import ClosableFormWrapper from "./ClosableFormWrapper";

function TrayForm({ queryClient }) {
    const [newTray, setNewTray] = useState({ name: "", location: "", rows: "", columns: "", notes: "" });

    // Mutation to add a tray
    const addTrayMutation = useMutation({
        mutationFn: addTray,
        onSuccess: () => queryClient.invalidateQueries(["trays"]),
        onError: (error) => alert(`Failed to add tray: ${error.message}`),
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        addTrayMutation.mutate({
            ...newTray,
            rows: parseInt(newTray.rows) || 0,
            columns: parseInt(newTray.columns) || 0,
        });
        setNewTray({ name: "", location: "", rows: "", columns: "", notes: "" }); // Reset form
    };

    return (
        <ClosableFormWrapper title="Add Tray">
            <form className="tray-form" onSubmit={handleSubmit}>
                <input type="text" placeholder="Name" value={newTray.name} onChange={(e) => setNewTray({ ...newTray, name: e.target.value })} required />
                <input type="text" placeholder="Location" value={newTray.location} onChange={(e) => setNewTray({ ...newTray, location: e.target.value })} required />
                <input type="number" placeholder="Rows" value={newTray.rows} onChange={(e) => setNewTray({ ...newTray, rows: parseInt(e.target.value) || 0 })} required />
                <input type="number" placeholder="Columns" value={newTray.columns} onChange={(e) => setNewTray({ ...newTray, columns: parseInt(e.target.value) || 0 })} required />
                <input type="text" placeholder="Notes" value={newTray.notes} onChange={(e) => setNewTray({ ...newTray, notes: e.target.value })} />
                <button type="submit" className="primary">Add Tray</button>
            </form>
        </ClosableFormWrapper>
    );
}

export default TrayForm;
