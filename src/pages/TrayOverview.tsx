import { useQuery } from "@tanstack/react-query";
import { fetchTrays } from "@/utils/api";
import { Tray } from "@/typings/types";
import "@/styles/Forms.css";
import TrayGrid from "@/components/display/TrayGrid/TrayGrid";

const TrayOverview: React.FC = () => {

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
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", // Adjusts dynamically to fit 3-4 columns
                    gap: "1rem", // Adds spacing between columns
                    width: "100%", // Ensures it spans full width
                }}
            >
                {trays?.map((tray) => (
                    <TrayGrid key={tray.id + tray.name} trayId={tray.id} enableVisibilityButton={false} enableEditing={false} />
                ))}
            </div>


        </div>
    );
};

export default TrayOverview;
