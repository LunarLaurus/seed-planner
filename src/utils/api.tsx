import {
    Cell,
    CellCoordinates,
    Plant,
    SeedingEvent,
    Species,
    Tray,
    TrayCell
} from "@/typings/types";
import axios from "axios";

// Environment & API URL configuration
const ENV_API_URL: string = import.meta.env.VITE_API_URL;
console.log("GUI: Found ENV_API_URL: " + ENV_API_URL);

const API_URL_BASE: string = 'api/v1';
const INTERNAL_API_URL_BASE: string = 'api/internal/v1';
console.log("GUI: Found INTERNAL_API_URL_BASE: " + INTERNAL_API_URL_BASE);

const API_URL: string = `${ENV_API_URL}/${API_URL_BASE}`;
console.log("GUI: Found API_URL: " + API_URL);

/**
 * Loads configuration from the internal config endpoint and stores it globally.
 * @returns {Promise<void>} A promise that resolves when configuration is loaded.
 */
export const loadConfig = async (): Promise<void> => {
    try {
        const response = await axios.get<Record<string, any>>(`${INTERNAL_API_URL_BASE}/config`);
        // Store configuration globally (if needed)
        window.env = response.data;
    } catch (err) {
        console.error("Failed to load config", err);
    }
};

/**
 * Fetches seeding events and transforms them into an array of SeedingEvent objects.
 * @returns {Promise<SeedingEvent[]>} A promise resolving to an array of seeding events.
 */
/**
 * Fetches seeding events from the API.
 * @returns {Promise<SeedingEvent[]>} A promise resolving to an array of seeding events.
 */
export const fetchSeedingEvents = async (): Promise<SeedingEvent[]> => {
    try {
        const response = await axios.get<SeedingEvent[]>(`${API_URL}/calendar`);
        return response.data;
    } catch (err) {
        console.error("Error fetching seeding events", err);
        throw err;
    }
};


/**
 * Fetches all plants from the API.
 * @returns {Promise<Plant[]>} A promise resolving to an array of Plant objects.
 */
export const fetchPlants = async (): Promise<Plant[]> => {
    try {
        const response = await axios.get<Plant[]>(`${API_URL}/plants`);
        return response.data;
    } catch (err) {
        console.error("Error fetching plants", err);
        throw err;
    }
};

/**
 * Fetches a single plant by its ID.
 * @param {number} plantId - The ID of the plant to fetch.
 * @returns {Promise<Plant>} A promise resolving to the Plant object.
 */
export const fetchPlantById = async (plantId: number): Promise<Plant> => {
    try {
        const response = await axios.get<Plant>(`${API_URL}/plants/${plantId}`);
        return response.data;
    } catch (err) {
        console.error(`Error fetching plant with id ${plantId}`, err);
        throw err;
    }
};

/**
 * Adds a new plant to the API.
 * @param {Plant} newPlant - The Plant object to add.
 * @returns {Promise<Plant>} A promise resolving to the newly created Plant object.
 */
export const addPlant = async (newPlant: Plant): Promise<Plant> => {
    try {
        const response = await axios.post<Plant>(`${API_URL}/plants`, newPlant);
        return response.data;
    } catch (err) {
        console.error("Error adding plant", err);
        throw err;
    }
};

/**
 * Deletes a plant by its ID.
 * @param {number} plantId - The ID of the plant to delete.
 * @returns {Promise<void>} A promise that resolves when the plant is deleted.
 */
export const deletePlant = async (plantId: number): Promise<void> => {
    try {
        await axios.delete(`${API_URL}/plants/${plantId}`);
    } catch (err) {
        console.error(`Error deleting plant with id ${plantId}`, err);
        throw err;
    }
};

/**
 * Updates plant details.
 * @param {number} plantId - The ID of the plant to update.
 * @param {Plant} updatedPlant - The updated Plant object.
 * @returns {Promise<Plant>} A promise resolving to the updated Plant object.
 */
export const updatePlant = async (plantId: number, updatedPlant: Plant): Promise<Plant> => {
    try {
        const response = await axios.put<Plant>(`${API_URL}/plants/${plantId}`, updatedPlant);
        return response.data;
    } catch (err) {
        console.error(`Error updating plant with id ${plantId}`, err);
        throw err;
    }
};

/**
 * Fetches all trays from the API.
 * @returns {Promise<Tray[]>} A promise resolving to an array of Tray objects.
 */
export const fetchTrays = async (): Promise<Tray[]> => {
    try {
        const response = await axios.get<Tray[]>(`${API_URL}/trays`);
        return response.data;
    } catch (err) {
        console.error("Error fetching trays", err);
        throw err;
    }
};

/**
 * Fetches a single tray by its ID.
 * @param {number} trayId - The ID of the tray to fetch.
 * @returns {Promise<Tray>} A promise resolving to the Tray object.
 */
export const fetchTrayById = async (trayId: number): Promise<Tray> => {
    try {
        const response = await axios.get<Tray>(`${API_URL}/trays/${trayId}`);
        return response.data;
    } catch (err) {
        console.error(`Error fetching tray with id ${trayId}`, err);
        throw err;
    }
};

/**
 * Adds a new tray to the API.
 * @param {Tray} newTray - The Tray object to add.
 * @returns {Promise<Tray>} A promise resolving to the newly created Tray object.
 */
export const addTray = async (newTray: Tray): Promise<Tray> => {
    try {
        const response = await axios.post<Tray>(`${API_URL}/trays`, newTray);
        return response.data;
    } catch (err) {
        console.error("Error adding tray", err);
        throw err;
    }
};

/**
 * Deletes a tray by its ID.
 * @param {number} trayId - The ID of the tray to delete.
 * @returns {Promise<void>} A promise that resolves when the tray is deleted.
 */
export const deleteTray = async (trayId: number): Promise<void> => {
    try {
        await axios.delete(`${API_URL}/trays/${trayId}`);
    } catch (err) {
        console.error(`Error deleting tray with id ${trayId}`, err);
        throw err;
    }
};

/**
 * Updates tray details.
 * @param {number} trayId - The ID of the tray to update.
 * @param {Tray} updatedTray - The updated Tray object.
 * @returns {Promise<Tray>} A promise resolving to the updated Tray object.
 */
export const updateTray = async (trayId: number, updatedTray: Tray): Promise<Tray> => {
    try {
        const response = await axios.put<Tray>(`${API_URL}/trays/${trayId}`, updatedTray);
        return response.data;
    } catch (err) {
        console.error(`Error updating tray with id ${trayId}`, err);
        throw err;
    }
};

/**
 * Fetches all species from the API.
 * @returns {Promise<Species[]>} A promise resolving to an array of Species objects.
 */
export const fetchSpecies = async (): Promise<Species[]> => {
    try {
        const response = await axios.get<Species[]>(`${API_URL}/species`);
        return response.data;
    } catch (err) {
        console.error("Error fetching species", err);
        throw err;
    }
};

/**
 * Fetches a single species by its ID.
 * @param {number} speciesId - The ID of the species to fetch.
 * @returns {Promise<Species>} A promise resolving to the Species object.
 */
export const fetchSpeciesById = async (speciesId: number): Promise<Species> => {
    try {
        const response = await axios.get<Species>(`${API_URL}/species/${speciesId}`);
        return response.data;
    } catch (err) {
        console.error(`Error fetching species with id ${speciesId}`, err);
        throw err;
    }
};

/**
 * Adds a new species to the API.
 * @param {Species} newSpecies - The Species object to add.
 * @returns {Promise<Species>} A promise resolving to the newly created Species object.
 */
export const addSpecies = async (newSpecies: Species): Promise<Species> => {
    try {
        const response = await axios.post<Species>(`${API_URL}/species`, newSpecies);
        return response.data;
    } catch (err) {
        console.error("Error adding species", err);
        throw err;
    }
};

/**
 * Deletes a species by its ID.
 * @param {number} speciesId - The ID of the species to delete.
 * @returns {Promise<void>} A promise that resolves when the species is deleted.
 */
export const deleteSpecies = async (speciesId: number): Promise<void> => {
    try {
        await axios.delete(`${API_URL}/species/${speciesId}`);
    } catch (err) {
        console.error(`Error deleting species with id ${speciesId}`, err);
        throw err;
    }
};

/**
 * Fetches tray grid data for a given tray ID.
 * @param {number} trayId - The ID of the tray for which to fetch the grid.
 * @returns {Promise<{ tray: Tray; grid: TrayCell[] }>} A promise resolving to an object containing the tray and its grid cells.
 */
export const fetchTrayGrid = async (trayId: number): Promise<{ tray: Tray; grid: TrayCell[] }> => {
    try {
        const response = await axios.get<{ tray: Tray; grid: TrayCell[] }>(`${API_URL}/trays/${trayId}/grid`);
        return response.data;
    } catch (err) {
        console.error(`Error fetching grid for tray with id ${trayId}`, err);
        throw err;
    }
};

/**
 * Assigns a plant to a cell within a tray.
 * @param {number} trayId - The ID of the tray.
 * @param {Cell} cell - The cell object containing coordinates and plant assignment.
 * @returns {Promise<Cell>} A promise resolving to the assigned cell data.
 */
export const assignPlantToCell = async (trayId: number, cell: Cell): Promise<Cell> => {
    try {
        const response = await axios.post<Cell>(`${API_URL}/trays/${trayId}/cells`, cell);
        return response.data;
    } catch (err) {
        console.error(`Error assigning plant to cell in tray ${trayId}`, err);
        throw err;
    }
};

/**
 * Resets a tray cell, removing any assigned plant.
 * @param {number} trayId - The ID of the tray.
 * @param {CellCoordinates} coords - The coordinates of the cell to reset.
 * @returns {Promise<void>} A promise that resolves when the cell is reset.
 */
export const resetTrayCell = async (trayId: number, coords: CellCoordinates): Promise<void> => {
    try {
        await axios.put(`${API_URL}/trays/${trayId}/cells/reset`, coords);
    } catch (err) {
        console.error(`Error resetting cell in tray ${trayId}`, err);
        throw err;
    }
};
