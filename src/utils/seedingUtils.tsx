import { SeedingEvent } from "@/typings/types";

/**
* Groups seeding events by month and year based on the event type.
* @param events - Array of seeding events
* @param type - The type of date to group by ("germination", "harvest", or "history")
* @returns An object with month-year keys mapping to event arrays
*/
export const groupByMonthYear = (events: SeedingEvent[], type: "germination" | "harvest" | "history") => {
  const grouped: Record<string, SeedingEvent[]> = {};

  events.forEach((event: SeedingEvent) => {
      const dateStr = 
          type === "germination" ? event.germination_date :
          type === "harvest" ? event.harvest_date :
          event.planted_date;

      if (!dateStr) return;

      const date = new Date(dateStr);
      const monthYear = date.toLocaleString("default", { month: "long", year: "numeric" });

      if (!grouped[monthYear]) grouped[monthYear] = [];
      grouped[monthYear].push(event);
  });

  return grouped;
};

/**
* Filters events that fall within a given time range.
* @param events - Array of seeding events
* @param key - The key to filter by ("planted_date", "germination_date", or "harvest_date")
* @param startDate - Start of the date range
* @param endDate - End of the date range
* @returns A filtered array of events within the date range
*/
export const filterEventsInRange = (events: SeedingEvent[], key: keyof SeedingEvent, startDate: Date, endDate: Date): SeedingEvent[] => {
  return events.filter((event) => {
      const eventDate = event[key] ? new Date(event[key]!) : null;
      return eventDate && eventDate >= startDate && eventDate <= endDate;
  });
};

/**
* Checks if an event falls within a given number of past days.
* @param eventDateStr - The event date as a string
* @param pastDays - Number of days in the past
* @returns `true` if the event is within the past `pastDays` days
*/
export const isRecentEvent = (eventDateStr: string, pastDays: number): boolean => {
  const eventDate = new Date(eventDateStr);
  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - pastDays);
  return eventDate >= pastDate;
};
