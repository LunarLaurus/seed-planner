import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchPlants, fetchSpecies } from "../utils/api";
import NewPlantModal from "../components/modal/NewPlantModal";
import PlantTable from "../components/table/PlantTable";
import "../styles/Forms.css";
import { Plant, Species } from "@/typings/types";

const Plants: React.FC = () => {
    const queryClient = useQueryClient();

    const { data: plants, isLoading, isError } = useQuery<Plant[]>({
        queryKey: ["plants"],
        queryFn: fetchPlants,
    });

    const { data: speciesList } = useQuery<Species[]>({
        queryKey: ["species"],
        queryFn: fetchSpecies,
    });

    if (isLoading) return <p>Loading plants...</p>;
    if (isError || !plants || !speciesList) return <p>Error loading plants. Check the backend.</p>;

    return (
        <div className="page-container">
            <h1>Plants</h1>
            <NewPlantModal speciesList={speciesList || []} queryClient={queryClient} />
            <PlantTable plants={plants} speciesList={speciesList} queryClient={queryClient} />;

        </div>
    );
};

export default Plants;
