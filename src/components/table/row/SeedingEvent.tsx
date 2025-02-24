interface SeedingEventProps {
    event: {
        plant_name: string;
        tray_name: string;
        planted_date: string;
        germination_date?: string;
        harvest_date?: string;
    };
    type: "germination" | "harvest" | "history";
}

const SeedingEvent: React.FC<SeedingEventProps> = ({ event, type }) => {
    const dateString =
        type === "germination" ? event.germination_date :
        type === "harvest" ? event.harvest_date :
        event.planted_date;

    const formattedDate = dateString ? new Date(dateString).toLocaleDateString() : "Unknown";

    return (
        <li>
            <strong>{event.plant_name}</strong> in <em>{event.tray_name}</em>
            {type === "germination" && ` (Germination: ${formattedDate})`}
            {type === "harvest" && ` (Harvest: ${formattedDate})`}
            {type === "history" && ` (Planted: ${formattedDate})`}
        </li>
    );
};

export default SeedingEvent;
