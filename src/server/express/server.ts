import 'dotenv/config';
import express, { Express, Request, Response } from 'express';
import packageJSON from "../../../package.json";
import cors from 'cors';
import path from "path";
import fs from "fs";
import { Pool } from 'pg';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { PgInstrumentation } from '@opentelemetry/instrumentation-pg';
import { Tray, Plant, TrayCell, Species } from '@/typings/types';
import { createServer } from 'http';

function log(text: string) {
  console.log("Seed-Planner-Api: " + text)
}

/* ===================== CONSTANTS & CONFIGURATION ===================== */

/**
 * Base URL for external API endpoints.
 * @constant {string}
 */
const API_URL_BASE: string = '/api/v1';

/**
 * Base URL for internal API endpoints.
 * @constant {string}
 */
const INTERNAL_API_URL_BASE: string = '/api/internal/v1';

/**
 * Tray-related endpoint base URL.
 * @constant {string}
 */
const TRAY_URL_BASE: string = `${API_URL_BASE}/trays`;

/**
 * Plant-related endpoint base URL.
 * @constant {string}
 */
const PLANTS_URL_BASE: string = `${API_URL_BASE}/plants`;

/**
 * Species-related endpoint base URL.
 * @constant {string}
 */
const SPECIES_URL_BASE: string = `${API_URL_BASE}/species`;

/**
 * Calendar-related endpoint base URL.
 * @constant {string}
 */
const CALENDARS_URL_BASE: string = `${API_URL_BASE}/calendar`;

/**
 * Express application instance.
 * @constant {Express}
 */
const SERVER_APPLICATION: Express = express();

/**
 * Server port number (default: 5000).
 * @constant {number}
 */
const SERVER_PORT: number = Number(process.env.PORT) || 5000;

/**
 * PostgreSQL connection pool.
 * @constant {Pool}
 */
const SERVER_DB_POOL: Pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 5432,
});

/* ===================== OPEN TELEMETRY SETUP ===================== */

// Initialize the OpenTelemetry tracer provider.
const provider = new NodeTracerProvider();
const exporter = new OTLPTraceExporter({
  url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
});
provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
provider.register();

// Register instrumentations for Express and PostgreSQL.
registerInstrumentations({
  instrumentations: [new ExpressInstrumentation(), new PgInstrumentation()],
});

/* ===================== MIDDLEWARE ===================== */

SERVER_APPLICATION.use(cors());
SERVER_APPLICATION.use(express.json({ limit: "20mb" }));
SERVER_APPLICATION.use(express.urlencoded({ extended: true }));

/* ===================== INTERNAL ENDPOINTS ===================== */

/**
 * GET /api/internal/v1/health
 * Internal health check endpoint for monitoring or wait-on usage.
 */
SERVER_APPLICATION.get(`${INTERNAL_API_URL_BASE}/health`, (_req: Request, res: Response) => {
  try {
    res.send({ status: "ok" });
  } catch (error) {
    console.error("Error in internal health check:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * GET /api/v1/health
 * Public health check endpoint.
 */
SERVER_APPLICATION.get(`${API_URL_BASE}/health`, (_req: Request, res: Response) => {
  try {
    res.send({ status: "ok" });
  } catch (error) {
    console.error("Error in public health check:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * GET /api/internal/v1/version
 * Returns version information from package.json and API URL.
 */
SERVER_APPLICATION.get(`${INTERNAL_API_URL_BASE}/version`, (_req: Request, res: Response) => {
  try {
    const respObj = {
      id: 1,
      version: packageJSON.version,
      api_url: process.env.API_URL as string,
    };
    res.send(respObj);
  } catch (error) {
    console.error("Error fetching version:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * GET /api/internal/v1/config
 * Returns frontend configuration variables.
 */
SERVER_APPLICATION.get(`${INTERNAL_API_URL_BASE}/config`, (_req: Request, res: Response) => {
  try {
    res.json({
      VITE_API_URL: process.env.VITE_API_URL || '',
      VITE_OTEL_EXPORTER_OTLP_ENDPOINT: process.env.VITE_OTEL_EXPORTER_OTLP_ENDPOINT || '',
    });
  } catch (error) {
    console.error("Error fetching config:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/* ===================== TRAY ROUTES ===================== */

/**
 * GET /api/v1/trays
 * Retrieves all trays from the database.
 */
SERVER_APPLICATION.get(`${TRAY_URL_BASE}`, async (_req: Request, res: Response) => {
  try {
    const result = await SERVER_DB_POOL.query<Tray>('SELECT * FROM trays');
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching trays:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * GET /api/v1/trays/:trayId
 * Retrieves a specific tray by its ID.
 */
SERVER_APPLICATION.get(`${TRAY_URL_BASE}/:trayId`, async (req: Request, res: Response) => {
  try {
    const { trayId } = req.params;
    const result = await SERVER_DB_POOL.query<Tray>('SELECT * FROM trays WHERE id = $1', [trayId]);
    if (result.rowCount) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'Tray not found' });
    }
  } catch (error) {
    console.error("Error fetching tray:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * POST /api/v1/trays
 * Creates a new tray with the provided details.
 */
SERVER_APPLICATION.post(`${TRAY_URL_BASE}`, async (req: Request, res: Response) => {
  try {
    const { name, location, rows, columns, notes } = req.body;
    const result = await SERVER_DB_POOL.query<Tray>(
      'INSERT INTO trays (name, location, rows, columns, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, location, rows, columns, notes]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error creating tray:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * PUT /api/v1/trays/:trayId
 * Updates an existing tray’s details.
 */
SERVER_APPLICATION.put(`${TRAY_URL_BASE}/:trayId`, async (req: Request, res: Response) => {
  try {
    const { trayId } = req.params;
    const { name, location, rows, columns, notes } = req.body;
    await SERVER_DB_POOL.query(
      'UPDATE trays SET name = $1, location = $2, rows = $3, columns = $4, notes = $5 WHERE id = $6',
      [name, location, rows, columns, notes, trayId]
    );
    res.json({ success: true });
  } catch (error) {
    console.error("Error updating tray:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * DELETE /api/v1/trays/:trayId
 * Deletes a tray and its associated tray cells.
 */
SERVER_APPLICATION.delete(`${TRAY_URL_BASE}/:trayId`, async (req: Request, res: Response) => {
  try {
    const { trayId } = req.params;
    await SERVER_DB_POOL.query('DELETE FROM tray_cells WHERE tray_id = $1', [trayId]);
    await SERVER_DB_POOL.query('DELETE FROM trays WHERE id = $1', [trayId]);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting tray:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/* ===================== PLANT ROUTES ===================== */

/**
 * GET /api/v1/plants
 * Retrieves all plants and joins species details.
 */
SERVER_APPLICATION.get(`${PLANTS_URL_BASE}`, async (_req: Request, res: Response) => {
  try {
    const result = await SERVER_DB_POOL.query<Plant>(`
      SELECT p.id, p.species_id, p.name, p.variety, s.genus, s.species, p.days_to_germinate, p.days_to_harvest
      FROM plants p
      JOIN species s ON p.species_id = s.id;
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching plants:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * GET /api/v1/plants/:plantId
 * Retrieves a specific plant by its ID.
 */
SERVER_APPLICATION.get(`${PLANTS_URL_BASE}/:plantId`, async (req: Request, res: Response) => {
  try {
    const { plantId } = req.params;
    const result = await SERVER_DB_POOL.query<Plant>('SELECT * FROM plants WHERE id = $1', [plantId]);
    if (result.rowCount) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'Plant not found' });
    }
  } catch (error) {
    console.error("Error fetching plant:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * POST /api/v1/plants
 * Creates a new plant with the provided details.
 */
SERVER_APPLICATION.post(`${PLANTS_URL_BASE}`, async (req: Request, res: Response) => {
  try {
    const { species_id, name, variety, days_to_germinate, days_to_harvest } = req.body;
    const result = await SERVER_DB_POOL.query<Plant>(
      'INSERT INTO plants (species_id, name, variety, days_to_germinate, days_to_harvest) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [species_id, name, variety, days_to_germinate, days_to_harvest]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error creating plant:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * PUT /api/v1/plants/:plantId
 * Updates an existing plant's details.
 */
SERVER_APPLICATION.put(`${PLANTS_URL_BASE}/:plantId`, async (req: Request, res: Response) => {
  try {
    const { plantId } = req.params;
    const { name, variety, days_to_germinate, days_to_harvest, species_id } = req.body;
    await SERVER_DB_POOL.query(
      'UPDATE plants SET name = $1, variety = $2, days_to_germinate = $3, days_to_harvest = $4, species_id = $5 WHERE id = $6',
      [name, variety, days_to_germinate, days_to_harvest, species_id, plantId]
    );
    res.json({ success: true });
  } catch (error) {
    console.error("Error updating plant:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * DELETE /api/v1/plants/:plantId
 * Deletes a plant and its associations in tray cells.
 */
SERVER_APPLICATION.delete(`${PLANTS_URL_BASE}/:plantId`, async (req: Request, res: Response) => {
  try {
    const { plantId } = req.params;
    await SERVER_DB_POOL.query('DELETE FROM tray_cells WHERE plant_id = $1', [plantId]);
    await SERVER_DB_POOL.query('DELETE FROM plants WHERE id = $1', [plantId]);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting plant:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/* ===================== CELL ROUTES ===================== */

/**
 * GET /api/v1/trays/:trayId/cells
 * Retrieves all cells for a specified tray along with associated plant details.
 */
SERVER_APPLICATION.get(`${TRAY_URL_BASE}/:trayId/cells`, async (req: Request, res: Response) => {
  try {
    const { trayId } = req.params;
    const result = await SERVER_DB_POOL.query<TrayCell>(
      `SELECT tray_cells.*, plants.name AS plant_name, plants.variety
        FROM tray_cells
        LEFT JOIN plants ON tray_cells.plant_id = plants.id
        WHERE tray_cells.tray_id = $1`,
      [trayId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching tray cells:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * POST /api/v1/trays/:trayId/cells
 * Assigns a plant to a specific cell in a tray. If the cell exists, it updates the plant assignment.
 */
SERVER_APPLICATION.post(`${TRAY_URL_BASE}/:trayId/cells`, async (req: Request, res: Response) => {
  try {
    const { trayId } = req.params;
    const { x, y, plant_id } = req.body;
    await SERVER_DB_POOL.query(
      `INSERT INTO tray_cells (tray_id, x, y, plant_id, planted_date)
        VALUES ($1, $2, $3, $4, CURRENT_DATE)
        ON CONFLICT (tray_id, x, y) DO UPDATE 
          SET plant_id = EXCLUDED.plant_id, planted_date = CURRENT_DATE`,
      [trayId, x, y, plant_id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error("Error assigning plant to cell:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * PUT /api/v1/trays/:trayId/cells/reset
 * Resets a specific cell by removing its plant assignment.
 */
SERVER_APPLICATION.put(`${TRAY_URL_BASE}/:trayId/cells/reset`, async (req: Request, res: Response) => {
  try {
    const { trayId } = req.params;
    const { x, y } = req.body;
    const result = await SERVER_DB_POOL.query(
      'UPDATE tray_cells SET plant_id = NULL WHERE tray_id = $1 AND x = $2 AND y = $3',
      [trayId, x, y]
    );
    if (result.rowCount === 0) {
      res.status(404).json({ error: "Cell not found or already empty" });
      return;
    }
    res.json({ success: true });
  } catch (error) {
    console.error(`Error resetting cell in tray ${req.params.trayId}:`, error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/* ===================== GRID ROUTES ===================== */

/**
 * GET /api/v1/trays/:trayId/grid
 * Retrieves a structured grid for a tray including cell, plant, and species details.
 */
SERVER_APPLICATION.get(`${TRAY_URL_BASE}/:trayId/grid`, async (req: Request, res: Response): Promise<void> => {
  try {
    const { trayId } = req.params;
    // Fetch the tray information
    const trayResult = await SERVER_DB_POOL.query<Tray>(
      'SELECT * FROM trays WHERE id = $1',
      [trayId]
    );
    if (trayResult.rowCount === 0) {
      res.status(404).json({ error: "Tray not found" });
      return;
    }
    // Fetch the grid details with associated plant and species info
    const gridResult = await SERVER_DB_POOL.query(
      `SELECT 
          tray_cells.*,
          plants.name AS plant_name,
          plants.variety AS plant_variety,
          plants.species_id,
          species.genus,
          species.species
        FROM tray_cells
        LEFT JOIN plants ON tray_cells.plant_id = plants.id
        LEFT JOIN species ON plants.species_id = species.id
        WHERE tray_cells.tray_id = $1`,
      [trayId]
    );
    res.json({ tray: trayResult.rows[0], grid: gridResult.rows });
  } catch (error) {
    console.error("Error fetching tray grid:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/* ===================== CALENDAR ROUTES ===================== */

/**
 * GET /api/v1/calendar
 * Retrieves the seeding calendar by joining tray_cells, trays, and plants.
 * Calculates germination and harvest dates based on the planted_date.
 */
SERVER_APPLICATION.get(`${CALENDARS_URL_BASE}`, async (_req: Request, res: Response) => {
  try {
    const result = await SERVER_DB_POOL.query(`
      SELECT tc.tray_id, t.name AS tray_name, p.name AS plant_name, 
              p.days_to_germinate, p.days_to_harvest, tc.planted_date
      FROM tray_cells tc
      JOIN trays t ON tc.tray_id = t.id
      JOIN plants p ON tc.plant_id = p.id;
    `);
    // Create calendar entries with calculated dates
    const calendar = result.rows.map(row => ({
      tray_name: row.tray_name,
      plant_name: row.plant_name,
      planted_date: row.planted_date,
      germination_date: new Date(row.planted_date).toISOString().split("T")[0],
      harvest_date: new Date(row.planted_date).toISOString().split("T")[0]
    }));
    res.json(calendar);
  } catch (error) {
    console.error("Error fetching calendar:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/* ===================== SPECIES ROUTES ===================== */

/**
 * GET /api/v1/species
 * Retrieves all species ordered by genus and species name.
 */
SERVER_APPLICATION.get(`${SPECIES_URL_BASE}`, async (_req: Request, res: Response) => {
  try {
    const result = await SERVER_DB_POOL.query<Species>('SELECT * FROM species ORDER BY genus, species');
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching species:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * POST /api/v1/species
 * Creates a new species record.
 */
SERVER_APPLICATION.post(`${SPECIES_URL_BASE}`, async (req: Request, res: Response) => {
  try {
    const { genus, species } = req.body;
    const result = await SERVER_DB_POOL.query<Species>(
      'INSERT INTO species (genus, species) VALUES ($1, $2) RETURNING *',
      [genus, species]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error creating species:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * DELETE /api/v1/species/:speciesId
 * Deletes a species record.
 */
SERVER_APPLICATION.delete(`${SPECIES_URL_BASE}/:speciesId`, async (req: Request, res: Response) => {
  try {
    const { speciesId } = req.params;
    await SERVER_DB_POOL.query("DELETE FROM species WHERE id = $1", [speciesId]);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting species:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/* ===================== STATIC FILES & SERVER START ===================== */

const __dirname = path.resolve();
// Check for local Vite build first
const localFrontendPath = path.join(__dirname, ".local/vite/dist");
const dockerFrontendPath = path.join(__dirname, "dist");
const frontendPath = fs.existsSync(localFrontendPath) ? localFrontendPath : dockerFrontendPath;

log(`Serving frontend from: ${frontendPath}`);

// Serve frontend files
if (fs.existsSync(frontendPath)) {
  SERVER_APPLICATION.use(express.static(frontendPath));

  SERVER_APPLICATION.get("*", (_req: Request, res: Response) => {
    const indexPath = path.join(frontendPath, "index.html");
    if (!fs.existsSync(indexPath)) {
      res.status(404).send("Frontend build not found.");
    } else {
      res.sendFile(indexPath);
    }
  });
} else {
  console.warn(`WARNING: No frontend build found. Checked paths:
  - Local build: ${localFrontendPath}
  - Docker build: ${dockerFrontendPath}`);
}

/**
 * Create and start the HTTP server.
 */
const server = createServer();
server.on("request", SERVER_APPLICATION);
server.listen(SERVER_PORT, "0.0.0.0", () => {
  SERVER_DB_POOL.connect()
    .then(() => log("Connected to Seed-Planner-PostgreSQL Backend"))
    .catch((err) => {
      console.error("Database connection error:", err);
      log("Unable to connect to backend, stopping application.");
      process.exit(1);
    });
  log("PORT:                  " + SERVER_PORT);
  log("API_URL_BASE:          " + API_URL_BASE);
  log("INTERNAL_API_URL_BASE: " + INTERNAL_API_URL_BASE);
});


