import { QueryClient, useMutation } from "@tanstack/react-query";
import { deletePlant } from "@/utils/api";
import { Plant, Species } from "@/typings/types";
import SortableTable from "./SortableTable";
import PlantRow from "./row/PlantRow";

interface PlantTableProps {
    plants: Plant[];
    speciesList: Species[];
    queryClient: QueryClient;
}

const PlantTable: React.FC<PlantTableProps> = ({ plants, speciesList, queryClient }) => {
    const deletePlantMutation = useMutation({
        mutationFn: (plantId: number) => deletePlant(plantId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["plants"] }),
        onError: (error) => alert(`Failed to delete plant: ${error.message}`),
    });

    // Convert speciesList into a lookup map for fast access
    const speciesMap: Record<number, string> = Object.fromEntries(
        speciesList.map(({ id, genus, species }) => [id, `${genus} ${species}`])
    );

    // Define Columns for SortableTable
    const columns = [
        { key: "variety", label: "Cultivar" },
        { key: "name", label: "Common Name" },
        { key: "species", label: "Botanical Name" },
        { key: "days_to_germinate", label: "Germination (days)" },
        { key: "days_to_harvest", label: "Harvest (days)" },
        { key: "actions", label: "Actions", disableSort: true },
    ];

    // Populate table data
    const tableData = plants.map((plant) => {
        const botanicalName = speciesMap[plant.species_id] || `Unknown Species (ID: ${plant.species_id})`;

        return {
            variety: plant.variety,
            name: plant.name,
            species: botanicalName,
            days_to_germinate: plant.days_to_germinate ?? "N/A", // Handle missing data
            days_to_harvest: plant.days_to_harvest ?? "N/A", // Handle missing data
            actions: <PlantRow key={plant.id} plant={plant} deletePlantMutation={deletePlantMutation} />,
        };
    });

    return <SortableTable title="Existing Plants" columns={columns} data={tableData} />;
};

export default PlantTable;
