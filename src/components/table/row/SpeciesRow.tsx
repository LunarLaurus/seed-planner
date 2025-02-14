import { Species } from "@/typings/types";
import { UseMutationResult } from "@tanstack/react-query";
import DeleteButton from "@/components/button/DeleteButton";
import CopySpeciesModal from "@/components/modal/CopySpeciesModal";

interface SpeciesRowProps {
    species: Species;
    deleteSpeciesMutation: UseMutationResult<void, Error, number>;
}

const SpeciesRow: React.FC<SpeciesRowProps> = ({ species, deleteSpeciesMutation }) => {
    return (
        <div className="button-group">
            <CopySpeciesModal copySpecies={species} />
            <DeleteButton
                entityName={`${species.genus} ${species.species}`}
                entityId={species.id}
                deleteMutation={deleteSpeciesMutation}
            />
        </div>
    );
};

export default SpeciesRow;
