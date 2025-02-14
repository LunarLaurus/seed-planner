import { useQuery } from "@tanstack/react-query";
import { fetchTrays, fetchSeedingEvents } from "@/utils/api";
import { SeedingEvent, Tray } from "@/typings/types";
import { filterEventsInRange, isRecentEvent } from "@/utils/seedingUtils";
import "@/styles/Forms.css";

/**
 * Dashboard component that displays current trays, recently planted events,
 * upcoming germinations, and upcoming harvests.
 *
 * Data is fetched only once on initial load using React Query.
 */
const Dashboard: React.FC = () => {
    // Fetch trays once and do not refetch on window focus.
    const { data: trays, isLoading: isTraysLoading } = useQuery<Tray[]>({
        queryKey: ["trays"],
        queryFn: fetchTrays,
        staleTime: Infinity,
        refetchOnWindowFocus: false,
    });

    // Fetch seeding calendar events once and do not refetch on window focus.
    const { data: calendarEvents, isLoading: isCalendarLoading } = useQuery<SeedingEvent[]>({
        queryKey: ["calendar"],
        queryFn: fetchSeedingEvents,
        staleTime: Infinity,
        refetchOnWindowFocus: false,
    });

    if (isTraysLoading || isCalendarLoading) return <p>Loading...</p>;

    const today = new Date();
    const sevenDaysAhead = new Date();
    sevenDaysAhead.setDate(today.getDate() + 7);

    // Filter events based on planting date, germination date, and harvest date.
    const recentlyPlanted = calendarEvents?.filter(event => isRecentEvent(event.planted_date, 14));
    const upcomingGerminations = filterEventsInRange(calendarEvents ?? [], "germination_date", today, sevenDaysAhead);
    const upcomingHarvests = filterEventsInRange(calendarEvents ?? [], "harvest_date", today, sevenDaysAhead);

    return (
        <div className="page-container">
            <h1>Dashboard</h1>
            <div className="content-container">
                <p>Overview of recent plantings, germination progress, and upcoming harvests.</p>
                <br />

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
                        {trays?.map((tray) => (
                            <tr key={tray.id}>
                                <td>{tray.name}</td>
                                <td>{tray.location}</td>
                                <td>{tray.notes || "—"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <br />

                <h2>Recently Planted</h2>
                {recentlyPlanted?.length ? (
                    <ul>
                        {recentlyPlanted.map((event, index) => (
                            <li key={`${event.tray_name}-${event.planted_date}-${index}`}>
                                {event.plant_name} in {event.tray_name} (Planted on {event.planted_date})
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No recent plantings.</p>
                )}

                <h2>Upcoming Germinations</h2>
                {upcomingGerminations?.length ? (
                    <ul>
                        {upcomingGerminations.map((event, index) => (
                            <li key={`${event.tray_name}-${event.germination_date}-${index}`}>
                                {event.plant_name} in {event.tray_name} (Germination: {event.germination_date})
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No upcoming germinations this week.</p>
                )}

                <h2>Upcoming Harvests</h2>
                {upcomingHarvests?.length ? (
                    <ul>
                        {upcomingHarvests.map((event, index) => (
                            <li key={`${event.tray_name}-${event.harvest_date}-${index}`}>
                                {event.plant_name} in {event.tray_name} (Harvest: {event.harvest_date})
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No upcoming harvests this week.</p>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
