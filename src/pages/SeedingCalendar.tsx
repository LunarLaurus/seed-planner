import { useQuery } from "@tanstack/react-query";
import { fetchSeedingEvents } from "@/utils/api";
import { groupByMonthYear } from "@/utils/seedingUtils";
import { SeedingEvent } from "@/typings/types";
import SeedingList from "@/components/table/SeedingList";
import "@/styles/Forms.css";

const SeedingCalendar: React.FC = () => {
    const { data: events = [], isLoading } = useQuery<SeedingEvent[], Error>({
        queryKey: ["calendar"],
        queryFn: fetchSeedingEvents,
        staleTime: 15 * 60 * 1000, // Cache for 15 minutes
    });

    if (isLoading) return <p>Loading seeding calendar...</p>;

    const today = new Date();

    const upcomingGerminations = groupByMonthYear(
        events.filter(event => event.germination_date && new Date(event.germination_date) >= today),
        "germination"
    );

    const upcomingHarvests = groupByMonthYear(
        events.filter(event => event.harvest_date && new Date(event.harvest_date) >= today),
        "harvest"
    );

    const plantingHistory = groupByMonthYear(events, "history");

    return (
        <div className="page-container">
            <h1>Seeding Calendar</h1>
            <SeedingList title="Upcoming Germinations" events={upcomingGerminations} type="germination" />
            <SeedingList title="Upcoming Harvests" events={upcomingHarvests} type="harvest" />
            <SeedingList title="Planting History" events={plantingHistory} type="history" />
        </div>
    );
};

export default SeedingCalendar;
