import { useState } from "react";
import DeleteButton from "../../button/DeleteButton";
import EditPlantModal from "../../modal/EditPlantModal";

function PlantRow({ plant, deletePlantMutation }) {
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
}

export default PlantRow;
