import SeedingEvent from "./row/SeedingEvent";

function SeedingList({ title, events, type }) {
    return (
        <div className="content-container">
            <h2>{title}</h2>
            {Object.keys(events).length > 0 ? (
                Object.entries(events).map(([monthYear, eventsForMonth]) => (
                    <div key={monthYear}>
                        <h3>{monthYear}</h3>
                        <ul>
                            {eventsForMonth.map(event => (
                                <SeedingEvent key={`${event.tray_name}-${event.planted_date}`} event={event} type={type} />
                            ))}
                        </ul>
                    </div>
                ))
            ) : (
                <p>No {title.toLowerCase()}.</p>
            )}
        </div>
    );
}

export default SeedingList;
