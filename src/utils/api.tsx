import { Cell, CellCoordinates, Plant, SeedingEvent, Species, Tray } from "@/typings/types";
import axios from "axios";

const ENV_API_URL = import.meta.env.VITE_API_URL;
console.log("GUI: Found ENV_API_URL: " + ENV_API_URL);

const API_URL_BASE = 'api/v1';
const INTERNAL_API_URL_BASE = 'api/internal/v1';
console.log("GUI: Found INTERNAL_API_URL_BASE: " + INTERNAL_API_URL_BASE);

const API_URL = ENV_API_URL + "/" + API_URL_BASE;

console.log("GUI: Found API_URL: " + API_URL);

export const loadConfig = (): Promise<void> => {
    return new Promise((resolve) => {
        axios.get(`${INTERNAL_API_URL_BASE}/config`)
            .then((data: Record<string, any>) => {
                window.env = data; // Store env vars globally
                resolve();
            })
            .catch((err: Error) => {
                console.error("Failed to load config", err);
                resolve(); // Allow app to continue rendering even if config fails
            });
    });
};

// Fetch the seeding calendar
export const fetchSeedingCalendar = async (): Promise<Record<string, { plant: string; date: string }[]>> => {
    const response = await axios.get(`${API_URL}/calendar`);
    return response.data;
};

export const fetchSeedingEvents = async (): Promise<SeedingEvent[]> => {
    const response = await fetch(`${API_URL}/calendar`); // Replace with your API URL
    if (!response.ok) throw new Error("Failed to fetch seeding calendar");

    const data: Record<string, { plant: string; date: string; }[]> = await response.json();

    // Transform the response into an array of SeedingEvent objects
    const events: SeedingEvent[] = Object.entries(data).flatMap(([key, entries]) =>
        entries.map(entry => ({
            plant_name: entry.plant,
            tray_name: key, // Assuming the key is the tray name
            planted_date: entry.date,
        }))
    );

    return events;
};


// Fetch all plants
export const fetchPlants = async (): Promise<Plant[]> => {
    const response = await axios.get(`${API_URL}/plants`);
    return response.data;
};

// Fetch a single plant by ID
export const fetchPlantById = async (plantId: number): Promise<Plant> => {
    const response = await axios.get(`${API_URL}/plants/${plantId}`);
    return response.data;
};

// Add a new plant
export const addPlant = async (newPlant: Plant): Promise<Plant> => {
    const response = await axios.post(`${API_URL}/plants`, newPlant);
    return response.data;
};

// Delete a plant
export const deletePlant = async (plantId: number): Promise<void> => {
    await axios.delete(`${API_URL}/plants/${plantId}`);
};

// Update plant details
export const updatePlant = async (plantId: number, updatedPlant: Plant): Promise<Plant> => {
    const response = await axios.put(`${API_URL}/plants/${plantId}`, updatedPlant);
    return response.data;
};

// Fetch all trays
export const fetchTrays = async (): Promise<Tray[]> => {
    const response = await axios.get(`${API_URL}/trays`);
    return response.data;
};

// Fetch a single tray by ID
export const fetchTrayById = async (trayId: number): Promise<Tray> => {
    const response = await axios.get(`${API_URL}/trays/${trayId}`);
    return response.data;
};

// Add a new tray
export const addTray = async (newTray: Tray): Promise<Tray> => {
    const response = await axios.post(`${API_URL}/trays`, newTray);
    return response.data;
};

// Delete a tray
export const deleteTray = async (trayId: number): Promise<void> => {
    await axios.delete(`${API_URL}/trays/${trayId}`);
};

// Update tray details
export const updateTray = async (trayId: number, updatedTray: Tray): Promise<Tray> => {
    const response = await axios.put(`${API_URL}/trays/${trayId}`, updatedTray);
    return response.data;
};

// Fetch species
export const fetchSpecies = async (): Promise<Species[]> => {
    const response = await axios.get(`${API_URL}/species`);
    return response.data;
};

// Fetch a single species by ID
export const fetchSpeciesById = async (speciesId: number): Promise<Species> => {
    const response = await axios.get(`${API_URL}/species/${speciesId}`);
    return response.data;
};

// Add a new species
export const addSpecies = async (newSpecies: Species): Promise<Species> => {
    const response = await axios.post(`${API_URL}/species`, newSpecies);
    return response.data;
};

// Delete a species
export const deleteSpecies = async (speciesId: number): Promise<void> => {
    await axios.delete(`${API_URL}/species/${speciesId}`);
};

// Fetch tray grid data
export const fetchTrayGrid = async (trayId: number): Promise<Cell[]> => {
    const response = await axios.get(`${API_URL}/trays/${trayId}/grid`);
    return response.data;
};

// Assign a plant to a cell
export const assignPlantToCell = async (trayId: number, cell: Cell): Promise<Cell> => {
    const response = await axios.post(`${API_URL}/trays/${trayId}/cells`, cell);
    return response.data;
};

// Reset a cell (remove plant)
export const resetTrayCell = async (trayId: number, coords: CellCoordinates): Promise<void> => {
    await axios.put(`${API_URL}/trays/${trayId}/cells/reset`, coords);
};
