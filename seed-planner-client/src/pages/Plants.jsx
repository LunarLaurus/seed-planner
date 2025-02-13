import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchPlants, fetchSpecies } from "../utils/api";
import NewPlantModal from "../components/modal/NewPlantModal";
import PlantTable from "../components/table/PlantTable";
import "../styles/Forms.css";

function Plants() {
    
    const queryClient = useQueryClient();

    // Fetch plants
    const { data: plants, isLoading, isError } = useQuery({
        queryKey: ["plants"],
        queryFn: fetchPlants,
    });

    // Fetch species for selection
    const { data: speciesList } = useQuery({
        queryKey: ["species"],
        queryFn: fetchSpecies,
    });

    if (isLoading) return <p>Loading plants...</p>;
    if (isError) return <p>Error loading plants. Check the backend.</p>;

    return (
        <div className="page-container">
            <h1>Plants</h1>
            <NewPlantModal speciesList={speciesList} queryClient={queryClient} />
            <PlantTable plants={plants} queryClient={queryClient} />
        </div>
    );
}

export default Plants;
