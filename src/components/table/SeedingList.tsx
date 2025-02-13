import SeedingEvent from "@/components/table/row/SeedingEvent";

interface SeedingEventType {
    plant_name: string;
    tray_name: string;
    planted_date: string;
    germination_date?: string;
    harvest_date?: string;
}

interface SeedingListProps {
    title: string;
    events: Record<string, SeedingEventType[]>; // Maps month-year to event list
    type: "germination" | "harvest" | "history";
}

const SeedingList: React.FC<SeedingListProps> = ({ title, events, type }) => {
    return (
        <div className="content-container">
            <h2>{title}</h2>
            {Object.keys(events).length > 0 ? (
                Object.entries(events).map(([monthYear, eventsForMonth]) => (
                    <div key={monthYear}>
                        <h3>{monthYear}</h3>
                        <ul>
                            {eventsForMonth.map((event) => (
                                <SeedingEvent
                                    key={`${event.tray_name}-${event.planted_date}`}
                                    event={event}
                                    type={type}
                                />
                            ))}
                        </ul>
                    </div>
                ))
            ) : (
                <p>No {title.toLowerCase()}.</p>
            )}
        </div>
    );
};

export default SeedingList;
