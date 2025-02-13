import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchSpecies } from "../utils/api";
import SpeciesTable from "../components/table/SpeciesTable";
import NewSpeciesModal from "../components/modal/NewSpeciesModal";
import "../styles/Forms.css";

function Species() {
    
    const queryClient = useQueryClient();

    // Fetch species list
    const { data: speciesList, isLoading, isError } = useQuery({
        queryKey: ["species"],
        queryFn: fetchSpecies,
    });

    if (isLoading) return <p>Loading species...</p>;
    if (isError) return <p>Error loading species. Check the backend.</p>;

    return (
        <div className="page-container">
            <h1>Species Management</h1>
            <NewSpeciesModal queryClient={queryClient}/>
            <SpeciesTable speciesList={speciesList} queryClient={queryClient} />
        </div>
    );
}

export default Species;
