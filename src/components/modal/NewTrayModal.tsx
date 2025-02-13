import { useState } from "react";
import { QueryClient, useMutation, UseMutationResult } from "@tanstack/react-query";
import { addTray } from "@/utils/api";
import { Tray } from "@/typings/types";
import "@/styles/modal/CommonModal.css";

interface NewTrayModalProps {
    queryClient: QueryClient;
}

const NewTrayModal: React.FC<NewTrayModalProps> = ({ queryClient }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [newTray, setNewTray] = useState<Tray>({
        id: 0,
        name: "",
        location: "",
        rows: 0,
        columns: 0,
        notes: "",
    });

    // Mutation to add a new tray
    const addTrayMutation: UseMutationResult<Tray, Error, Tray> = useMutation({
        mutationFn: addTray,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["trays"] });
            setNewTray(newTray);
            setIsOpen(false);
        },
        onError: (error: any) => alert(`Failed to add tray: ${error.message}`),
    });

    // Handle form submission
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isFormValid()) {
            addTrayMutation.mutate(newTray);
        }
    };

    // Ensure all required fields are filled before enabling the submit button
    const isFormValid = (): boolean => {
        return (
            newTray.name.trim() !== "" &&
            newTray.location.trim() !== "" &&
            isPositiveInteger(newTray.columns) &&
            isPositiveInteger(newTray.rows)
        );
    };

    // Helper function to check if a value is a positive integer
    const isPositiveInteger = (value: number): boolean => {
        return Number.isInteger(value) && value > 0;
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
                                value={newTray.rows || ""}
                                onChange={(e) => setNewTray({ ...newTray, rows: Number(e.target.value) || 0 })}
                                required
                            />
                            <input
                                type="number"
                                placeholder="Columns"
                                value={newTray.columns || ""}
                                onChange={(e) => setNewTray({ ...newTray, columns: Number(e.target.value) || 0 })}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Notes"
                                value={newTray.notes}
                                onChange={(e) => setNewTray({ ...newTray, notes: e.target.value })}
                            />

                            <div className="modal-actions">
                                <button type="submit" className={`primary ${isFormValid() ? "" : "inactive"}`} disabled={!isFormValid()}>
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
};

export default NewTrayModal;
