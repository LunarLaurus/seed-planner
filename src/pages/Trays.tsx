import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchTrays } from "@/utils/api";
import { useNavigate } from "react-router-dom";
import { Tray } from "@/typings/types";
import TrayTable from "@/components/table/TrayTable";
import NewTrayModal from "@/components/modal/NewTrayModal";
import "@/styles/Forms.css";

const Trays: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Fetch trays
    const { data: trays, isLoading, isError } = useQuery<Tray[]>({
        queryKey: ["trays"],
        queryFn: fetchTrays,
    });

    if (isLoading) return <p>Loading trays...</p>;
    if (isError) return <p>Error loading trays. Check the backend.</p>;

    return (
        <div className="page-container">
            <h1>Trays</h1>
            <NewTrayModal queryClient={queryClient} />
            <TrayTable trays={trays || []} navigate={navigate} queryClient={queryClient} />
        </div>
    );
};

export default Trays;
