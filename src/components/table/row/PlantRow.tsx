import { useState } from "react";
import { UseMutationResult } from "@tanstack/react-query";
import { Plant } from "@/typings/types";
import DeleteButton from "@/components/button/DeleteButton";
import EditPlantModal from "@/components/modal/EditPlantModal";

interface PlantRowProps {
    plant: Plant;
    deletePlantMutation: UseMutationResult<void, unknown, number>;
}

const PlantRow: React.FC<PlantRowProps> = ({ plant, deletePlantMutation }) => {
    const [isEditOpen, setIsEditOpen] = useState(false);

    return (
        <div className="button-group">
            <button className="edit" onClick={() => setIsEditOpen(true)}>Edit</button>
            <DeleteButton
                entityName={`${plant.name} - ${plant.variety}`}
                entityId={plant.id}
                deleteMutation={deletePlantMutation}
            />
            {isEditOpen && <EditPlantModal plantId={plant.id} onClose={() => setIsEditOpen(false)} />}
        </div>
    );
};

export default PlantRow;
