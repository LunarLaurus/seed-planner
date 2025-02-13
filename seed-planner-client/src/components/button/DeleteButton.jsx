import { useState } from "react";
import DeleteModal from "../modal/DeleteModal";

function DeleteButton({ entityName, entityId, deleteMutation }) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleDelete = () => {
        deleteMutation.mutate(entityId);
        setIsModalOpen(false);
    };

    return (
        <>
            <button className="delete" onClick={() => setIsModalOpen(true)}>
                Delete
            </button>
            <DeleteModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleDelete}
                entityName={entityName}
            />
        </>
    );
}

export default DeleteButton;
