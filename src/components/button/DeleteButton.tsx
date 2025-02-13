import { useState } from "react";
import { UseMutationResult } from "@tanstack/react-query";
import DeleteModal from "@/components/modal/DeleteModal";

interface DeleteButtonProps {
    entityName: string;
    entityId: number;
    deleteMutation: UseMutationResult<void, unknown, number>;
}

const DeleteButton: React.FC<DeleteButtonProps> = ({ entityName, entityId, deleteMutation }) => {
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
};

export default DeleteButton;
