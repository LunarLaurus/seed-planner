import { useQuery } from "@tanstack/react-query";
import { fetchTrays, fetchSeedingCalendar } from "../utils/api"; // Import API functions
import "../styles/Forms.css";

function Dashboard() {
    const { data: trays, isLoading: isTraysLoading } = useQuery({
        queryKey: ["trays"],
        queryFn: fetchTrays,
    });

    const { data: calendarEvents, isLoading: isCalendarLoading } = useQuery({
        queryKey: ["calendar"],
        queryFn: fetchSeedingCalendar,
    });

    if (isTraysLoading || isCalendarLoading) return <p>Loading...</p>;

    const today = new Date();
    const sevenDaysAhead = new Date();
    sevenDaysAhead.setDate(today.getDate() + 7);

    // Filter events for recently planted (within the last 14 days)
    const recentlyPlanted = calendarEvents?.filter(event =>
        new Date(event.planted_date) >= new Date(today.setDate(today.getDate() - 14)) // within last 7 days
    );

    // Filter events for upcoming germinations within the next 7 days
    const upcomingGerminations = calendarEvents?.filter(event =>
        new Date(event.germination_date) >= today && new Date(event.germination_date) <= sevenDaysAhead
    );

    // Filter events for upcoming harvests within the next 7 days
    const upcomingHarvests = calendarEvents?.filter(event =>
        new Date(event.harvest_date) >= today && new Date(event.harvest_date) <= sevenDaysAhead
    );

    return (
        <div className="page-container">
            <h1>Dashboard</h1>
            <div className="content-container">
                <p>Overview of recent plantings, germination progress, and upcoming harvests.</p>
                <br />

                {/* ✅ Existing Trays Section */}
                <h2>Current Trays</h2>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Location</th>
                            <th>Notes</th>
                        </tr>
                    </thead>
                    <tbody>
                        {trays?.map(tray => (
                            <tr key={tray.id}>
                                <td>{tray.name}</td>
                                <td>{tray.location}</td>
                                <td>{tray.notes}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <br />

                {/* ✅ Recently Planted Section */}
                <h2>Recently Planted</h2>
                {recentlyPlanted?.length > 0 ? (
                    <ul>
                        {recentlyPlanted.map(event => (
                            <li key={`${event.tray_name}-${event.planted_date}`}>
                                {event.plant_name} in {event.tray_name} (Planted on {event.planted_date})
                            </li>
                        ))}
                    </ul>
                ) : <p>No recent plantings.</p>}

                {/* ✅ Upcoming Germinations Section */}
                <h2>Upcoming Germinations</h2>
                {upcomingGerminations?.length > 0 ? (
                    <ul>
                        {upcomingGerminations.map(event => (
                            <li key={`${event.tray_name}-${event.germination_date}`}>
                                {event.plant_name} in {event.tray_name} (Germination: {event.germination_date})
                            </li>
                        ))}
                    </ul>
                ) : <p>No upcoming germinations this week.</p>}

                {/* ✅ Upcoming Harvests Section */}
                <h2>Upcoming Harvests</h2>
                {upcomingHarvests?.length > 0 ? (
                    <ul>
                        {upcomingHarvests.map(event => (
                            <li key={`${event.tray_name}-${event.harvest_date}`}>
                                {event.plant_name} in {event.tray_name} (Harvest: {event.harvest_date})
                            </li>
                        ))}
                    </ul>
                ) : <p>No upcoming harvests this week.</p>}
            </div>
        </div>
    );
}

export default Dashboard;
