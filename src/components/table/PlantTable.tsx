import { QueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { deletePlant, fetchSpeciesById } from "../../utils/api";
import SortableTable from "./SortableTable";
import PlantRow from "./row/PlantRow";
import { Plant } from "@/typings/types";

interface PlantTableProps {
    plants: Plant[];
    queryClient: QueryClient;
}

const PlantTable: React.FC<PlantTableProps> = ({ plants, queryClient }) => {
    const deletePlantMutation = useMutation({
        mutationFn: (plantId: number) => deletePlant(plantId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["plants"] }),
        onError: (error: any) => alert(`Failed to delete plant: ${error.message}`),
    });

    // Fetch species names for all unique species IDs
    const uniqueSpeciesIds = [...new Set(plants.map((p) => p.species_id))];

    const speciesQueries = uniqueSpeciesIds.map((id) => ({
        id,
        query: useQuery({
            queryKey: ["species", id],
            queryFn: () => fetchSpeciesById(id),
            enabled: !!id,
        }),
    }));

    const speciesMap = Object.fromEntries(
        speciesQueries.map(({ id, query }) => [id, query.data?.genus + " " + query.data?.species || `Id: ${id}`])
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

    const tableData = plants?.map((plant) => ({
        variety: plant.variety,
        name: plant.name,
        species: speciesMap[plant.species_id] || `Id: ${plant.species_id}`,
        days_to_germinate: plant.days_to_germinate,
        days_to_harvest: plant.days_to_harvest,
        actions: <PlantRow key={plant.id} plant={plant} deletePlantMutation={deletePlantMutation} />,
    })) || [];

    return <SortableTable title="Existing Plants" columns={columns} data={tableData} />;
};

export default PlantTable;
