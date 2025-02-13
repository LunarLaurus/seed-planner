import { useMutation } from "@tanstack/react-query";
import { deletePlant } from "../../utils/api";
import SortableTable from "./SortableTable";
import PlantRow from "./row/PlantRow";

function PlantTable({ plants, queryClient }) {

    const deletePlantMutation = useMutation({
        mutationFn: (plantId) => deletePlant(plantId),
        onSuccess: () => queryClient.invalidateQueries(["plants"]),
        onError: (error) => alert(`Failed to delete plant: ${error.message}`),
    });

    // Define Columns for SortableTable
    const columns = [
        { key: "variety", label: "Cultivar" },
        { key: "name", label: "Common Name" },
        { key: "species", label: "Botanical Name" },
        { key: "days_to_germinate", label: "Germination (days)" },
        { key: "days_to_harvest", label: "Harvest (days)" },
        { key: "actions", label: "Actions", disableSort: true },
    ];

    const tableData = plants?.map(plant => ({
        variety: plant.variety,
        name: plant.name,
        species: `${plant.genus} ${plant.species}`,
        days_to_germinate: plant.days_to_germinate,
        days_to_harvest: plant.days_to_harvest,
        actions: (
            <PlantRow
                key={plant.id}
                plant={plant}
                deletePlantMutation={deletePlantMutation}
            />
        ),
    })) || [];

    return (
        <SortableTable title={'Existing Plants'} columns={columns} data={tableData} />
    );
}

export default PlantTable;
