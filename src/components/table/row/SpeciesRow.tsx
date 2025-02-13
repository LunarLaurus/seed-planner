import { Species } from "@/typings/types";
import DeleteButton from "@/components/button/DeleteButton";
import { UseMutationResult } from "@tanstack/react-query";

interface SpeciesRowProps {
    species: Species;
    deleteSpeciesMutation: UseMutationResult<void, any, number>;
}

const SpeciesRow: React.FC<SpeciesRowProps> = ({ species, deleteSpeciesMutation }) => {
    return (
        <div className="button-group">
            <DeleteButton
                entityName={`${species.genus} ${species.species}`}
                entityId={species.id}
                deleteMutation={deleteSpeciesMutation}
            />
        </div>
    );
};

export default SpeciesRow;
