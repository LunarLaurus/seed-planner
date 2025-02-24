import { UseMutationResult } from "@tanstack/react-query";
import { Plant } from "@/typings/types";
import DeleteButton from "@/components/button/DeleteButton";
import CopyPlantModal from "@/components/modal/CopyPlantModal";
import EditPlantModal from "@/components/modal/EditPlantModal";

interface PlantRowProps {
    plant: Plant;
    deletePlantMutation: UseMutationResult<void, unknown, number>;
}

const PlantRow: React.FC<PlantRowProps> = ({ plant, deletePlantMutation }) => {

    return (
        <div className="button-group">
            <EditPlantModal plantId={plant.id} />
            <CopyPlantModal copyPlant={plant} />
            <DeleteButton
                entityName={`${plant.name} - ${plant.variety}`}
                entityId={plant.id}
                deleteMutation={deletePlantMutation}
            />
        </div>
    );
};

export default PlantRow;
