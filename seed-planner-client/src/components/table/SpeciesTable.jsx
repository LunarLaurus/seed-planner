import { useMutation } from "@tanstack/react-query";
import { deleteSpecies } from "../../utils/api";
import SortableTable from "./SortableTable";
import SpeciesRow from "./row/SpeciesRow";

function SpeciesTable({ speciesList, queryClient }) {

    const deleteSpeciesMutation = useMutation({
        mutationFn: (speciesId) => deleteSpecies(speciesId),
        onSuccess: () => queryClient.invalidateQueries(["species"]),
        onError: (error) => alert(`Failed to delete species: ${error.message}`),
    });

    // Define Columns for SortableTable
    const columns = [
        { key: "genus", label: "Genus" },
        { key: "species", label: "Species" },
        { key: "actions", label: "Actions", disableSort: true },
    ];

    // ✅ Ensure hooks are outside of `.map()`
    const tableData = speciesList?.map(species => ({
        genus: species.genus,
        species: species.species,
        actions: (
            <SpeciesRow
                key={species.id}
                species={species}
                deleteSpeciesMutation={deleteSpeciesMutation}
            />
        ),
    })) || [];

    return (
        <SortableTable title={'Existing Species'} columns={columns} data={tableData} />
    );
}

export default SpeciesTable;
