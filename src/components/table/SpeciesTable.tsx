import { QueryClient, useMutation } from "@tanstack/react-query";
import { deleteSpecies } from "@/utils/api";
import { Species } from "@/typings/types";
import SortableTable from "./SortableTable";
import SpeciesRow from "./row/SpeciesRow";

interface SpeciesTableProps {
    speciesList: Species[];
    queryClient: QueryClient;
}

const SpeciesTable: React.FC<SpeciesTableProps> = ({ speciesList, queryClient }) => {
    const deleteSpeciesMutation = useMutation({
        mutationFn: (speciesId: number) => deleteSpecies(speciesId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["species"] }),
        onError: (error) => alert(`Failed to delete species: ${error.message}`),
    });

    // Define Columns
    const columns = [
        { key: "genus", label: "Genus" },
        { key: "species", label: "Species" },
        { key: "actions", label: "Actions", disableSort: true },
    ];

    // Map species data for the table
    const tableData = speciesList.map(species => ({
        genus: species.genus,
        species: species.species,
        actions: (
            <SpeciesRow
                key={species.id}
                species={species}
                deleteSpeciesMutation={deleteSpeciesMutation}
            />
        ),
    }));

    return <SortableTable title="Existing Species" columns={columns} data={tableData} />;
};

export default SpeciesTable;
