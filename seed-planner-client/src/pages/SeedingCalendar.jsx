import { useQuery } from "@tanstack/react-query";
import { fetchSeedingCalendar } from "../utils/api";
import SeedingList from "../components/table/SeedingList";
import "../styles/Forms.css";

// Helper function to group events by month/year
const groupByMonthYear = (events, type) => {
    const grouped = {};

    events.forEach(event => {
        // Get the date based on type (germination, harvest, or planted)
        const date = new Date(type === "germination" ? event.germination_date :
            type === "harvest" ? event.harvest_date : event.planted_date);
        const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' }); // Group by month and year

        if (!grouped[monthYear]) {
            grouped[monthYear] = [];
        }
        grouped[monthYear].push(event);
    });

    return grouped;
};

function SeedingCalendar() {
    const { data: events, isLoading } = useQuery({
        queryKey: ["calendar"],
        queryFn: fetchSeedingCalendar,
    });

    if (isLoading) return <p>Loading seeding calendar...</p>;

    const today = new Date();

    // ✅ Group events by month/year
    const upcomingGerminations = events ? groupByMonthYear(
        events.filter(event => new Date(event.germination_date) >= today), "germination"
    ) : {};

    const upcomingHarvests = events ? groupByMonthYear(
        events.filter(event => new Date(event.harvest_date) >= today), "harvest"
    ) : {};

    const plantingHistory = events ? groupByMonthYear(
        events, "history"
    ) : {};

    return (
        <div className="page-container">
            <h1>Seeding Calendar</h1>

            <SeedingList title="Upcoming Germinations" events={upcomingGerminations} type="germination" />
            <SeedingList title="Upcoming Harvests" events={upcomingHarvests} type="harvest" />
            <SeedingList title="Planting History" events={plantingHistory} type="history" />
        </div>
    );
}

export default SeedingCalendar;
