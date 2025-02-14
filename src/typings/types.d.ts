// Global TypeScript Interfaces

export interface VersionResponse {
  id: number;
  version: string;
  api_url: string;
}

export interface Species {
  id: number;
  genus: string;
  species: string;
}

export interface Plant {
  id: number;
  species_id: number;
  name: string;
  variety: string;
  days_to_germinate?: number; // Optional since it may not always be provided
  days_to_harvest?: number; // Optional for same reason
}

export interface Tray {
  id: number;
  name: string;
  location: string;
  rows: number;
  columns: number;
  notes?: string; // Optional as not all trays may have notes
}

export interface TrayCell {
  id: number;
  tray_id: number;
  x: number;
  y: number;
  plant_id?: number | null; // Can be null if no plant is assigned
  planted_date: string; // Stored as a string in YYYY-MM-DD format
}

export interface DisplayCell extends TrayCell {
  plant_name?: string | null;
  variety?: string | null;
}

// Coordinates for interacting with tray grid
export interface CellCoordinates {
  x: number;
  y: number;
}

// Used when assigning a plant to a cell
export interface Cell extends CellCoordinates {
  plant_id: number;
  planted_date: string;
}

// API Responses (if needed)
export type SeedingCalendar = Record<string, { plant: string; date: string }[]>; // Adjust structure if needed

export interface SeedingEvent {
  plant_name: string;
  tray_name: string;
  planted_date: string;
  germination_date?: string;
  harvest_date?: string;
}