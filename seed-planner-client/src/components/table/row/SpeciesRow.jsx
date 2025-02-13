import DeleteButton from "../../button/DeleteButton";

function SpeciesRow({ species, deleteSpeciesMutation }) {
    return (
        <div className="button-group">
            <DeleteButton
                entityName={`${species.genus} ${species.species}`}
                entityId={species.id}
                deleteMutation={deleteSpeciesMutation}
            />
        </div>
    );
}

export default SpeciesRow;
