function SeedingEvent({ event, type }) {
    const formattedDate = new Date(type === "germination" ? event.germination_date : type === "harvest" ? event.harvest_date : event.planted_date).toLocaleDateString();

    return (
        <li>
            <strong>{event.plant_name}</strong> in <em>{event.tray_name}</em> 
            {type === "germination" && ` (Germination: ${formattedDate})`}
            {type === "harvest" && ` (Harvest: ${formattedDate})`}
            {type === "history" && ` (Planted: ${formattedDate})`}
        </li>
    );
}

export default SeedingEvent;