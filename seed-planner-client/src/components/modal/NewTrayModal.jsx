import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { addTray } from "../../utils/api";
import "../../styles/modal/CommonModal.css";

function NewTrayModal({ queryClient }) {
    const [isOpen, setIsOpen] = useState(false);
    const [newTray, setNewTray] = useState({
        name: "",
        location: "",
        rows: "",
        columns: "",
        notes: "",
    });

    // Mutation to add a new tray to the database
    const addTrayMutation = useMutation({
        mutationFn: addTray,
        onSuccess: () => {
            queryClient.invalidateQueries(["trays"]);
            setNewTray({ name: "", location: "", rows: "", columns: "", notes: "" }); // Reset form fields after successful submission
            setIsOpen(false); // Close modal on success
        },
        onError: (error) => alert(`Failed to add tray: ${error.message}`),
    });

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        if (isFormValid()) {
            addTrayMutation.mutate({
                ...newTray,
                rows: parseInt(newTray.rows) || 0,
                columns: parseInt(newTray.columns) || 0,
            });
        }
    };

    // Ensure all required fields are filled before enabling the submit button
    const isFormValid = () => {
        return (
            Object.values(newTray).every(value => value !== "") && // Ensure no empty fields
            isPositiveInteger(newTray.columns) &&
            isPositiveInteger(newTray.rows)
        );
    };

    // Helper function to check if a value is a positive integer
    const isPositiveInteger = (value) => {
        return Number.isInteger(Number(value)) && Number(value) > 0;
    };

    return (
        <div className="modal-open-btn-container">
            <button className="modal-open-btn" onClick={() => setIsOpen(true)}>Add New Tray</button>

            {isOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Add New Tray</h2>
                        <form className="tray-form" onSubmit={handleSubmit}>
                            <input
                                type="text"
                                placeholder="Name"
                                value={newTray.name}
                                onChange={(e) => setNewTray({ ...newTray, name: e.target.value })}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Location"
                                value={newTray.location}
                                onChange={(e) => setNewTray({ ...newTray, location: e.target.value })}
                                required
                            />
                            <input
                                type="number"
                                placeholder="Rows"
                                value={newTray.rows}
                                onChange={(e) => setNewTray({ ...newTray, rows: parseInt(e.target.value) || 0 })}
                                required
                            />
                            <input
                                type="number"
                                placeholder="Columns"
                                value={newTray.columns}
                                onChange={(e) => setNewTray({ ...newTray, columns: parseInt(e.target.value) || 0 })}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Notes"
                                value={newTray.notes}
                                onChange={(e) => setNewTray({ ...newTray, notes: e.target.value })}
                            />

                            <div className="modal-actions">
                                <button
                                    type="submit"
                                    className={`primary ${isFormValid() ? "" : "inactive"}`}
                                    disabled={!isFormValid()}
                                >
                                    Add Tray
                                </button>
                                <button type="button" className="cancel" onClick={() => setIsOpen(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default NewTrayModal;
