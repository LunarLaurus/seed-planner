import axios from "axios";

const API_URL = "http://localhost:5000";

// Fetch the seeding calendar (if needed later)
export const fetchSeedingCalendar = async () => {
    const response = await axios.get(`${API_URL}/calendar`);
    return response.data;
};

// Fetch all plants
export const fetchPlants = async () => {
    const response = await axios.get(`${API_URL}/plants`);
    return response.data;
};

// Fetch a single plant by ID
export const fetchPlantById = async (plantId) => {
    const response = await axios.get(`${API_URL}/plants/${plantId}`);
    return response.data;
};

// Add a new plant
export const addPlant = async (newPlant) => {
    return axios.post(`${API_URL}/plants`, newPlant);
};

// Delete a plant
export const deletePlant = async (plantId) => {
    return axios.delete(`${API_URL}/plants/${plantId}`);
};

// Update plant details
export const updatePlant = async (plantId, updatedPlant) => {
    return axios.put(`${API_URL}/plants/${plantId}`, updatedPlant);
};

// Fetch all trays
export const fetchTrays = async () => {
    const response = await axios.get(`${API_URL}/trays`);
    return response.data;
};

// Fetch a single tray by ID
export const fetchTrayById = async (trayId) => {
    const response = await axios.get(`${API_URL}/trays/${trayId}`);
    return response.data;
};

// Add a new tray
export const addTray = async (newTray) => {
    return axios.post(`${API_URL}/trays`, newTray);
};

// Delete a tray
export const deleteTray = async (trayId) => {
    return axios.delete(`${API_URL}/trays/${trayId}`);
};

// Update tray details
export const updateTray = async (trayId, updatedTray) => {
    return axios.put(`${API_URL}/trays/${trayId}`, updatedTray);
};

// Fetch species (used for plant selection dropdown later)
export const fetchSpecies = async () => {
    const response = await axios.get(`${API_URL}/species`);
    return response.data;
};

// Add a new species
export const addSpecies = async (newSpecies) => {
    return axios.post(`${API_URL}/species`, newSpecies);
};

// Delete a species
export const deleteSpecies = async (speciesId) => {
    return axios.delete(`${API_URL}/species/${speciesId}`);
};

// Fetch tray grid data
export const fetchTrayGrid = async (trayId) => {
    const response = await axios.get(`${API_URL}/trays/${trayId}/grid`);
    return response.data;
};

// Assign a plant to a cell
export const assignPlantToCell = async (trayId, { x, y, plant_id }) => {
    return axios.post(`${API_URL}/trays/${trayId}/cells`, { x, y, plant_id });
};

// Reset a cell (remove plant)
export const resetTrayCell = async (trayId, { x, y }) => {
    return axios.put(`${API_URL}/trays/${trayId}/cells/reset`, { x, y });
};
