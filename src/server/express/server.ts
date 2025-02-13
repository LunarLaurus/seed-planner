import 'dotenv/config';
import express, { Request, Response } from 'express';
import packageJSON from "../../../package.json";
import cors from 'cors';
import { Pool } from 'pg';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { PgInstrumentation } from '@opentelemetry/instrumentation-pg';
import { Tray, Plant, TrayCell, Species } from '@/typings/types';
import { createServer } from 'http';

const API_URL_BASE = '/api/v1';
console.log("SERVER: Found API_URL_BASE: " + API_URL_BASE);

const INTERNAL_API_URL_BASE = '/api/internal/v1';
console.log("SERVER: Found INTERNAL_API_URL_BASE: " + INTERNAL_API_URL_BASE);

const TRAY_URL_BASE = API_URL_BASE + '/trays';
const PLANTS_URL_BASE = API_URL_BASE + '/plants';
const SPECIES_URL_BASE = API_URL_BASE + '/species';
const CALENDARS_URL_BASE = API_URL_BASE + '/calendar';

const SERVER_APPLICATION = express();
const SERVER_PORT = Number(process.env.PORT) || 5000;

const SERVER_DB_POOL = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 5432,
});

// OpenTelemetry Setup
const provider = new NodeTracerProvider();
const exporter = new OTLPTraceExporter({
  url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
});
provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
provider.register();

registerInstrumentations({
  instrumentations: [new ExpressInstrumentation(), new PgInstrumentation()],
});

SERVER_APPLICATION.use(cors());
SERVER_APPLICATION.use(express.json({ limit: "20mb" }));
SERVER_APPLICATION.use(express.urlencoded({ extended: true }));

/* --------------------- INTERNAL --- */
// Serve a successful response. For use with wait-on
SERVER_APPLICATION.get(`${INTERNAL_API_URL_BASE}/health`, (_req, res) => {
  res.send({ status: "ok" });
});
SERVER_APPLICATION.get(`${API_URL_BASE}/health`, (_req, res) => {
  res.send({ status: "ok" });
});

SERVER_APPLICATION.get(`${INTERNAL_API_URL_BASE}/version`, (_req: Request, res: Response) => {
  const respObj = {
    id: 1,
    version: packageJSON.version,
    api_url: process.env.API_URL as string,
  };
  res.send(respObj);
});

/* --------------------- FRONTEND CONFIG ROUTE --------------------- */
SERVER_APPLICATION.get(`${INTERNAL_API_URL_BASE}/config`, (_req: Request, res: Response) => {
  res.json({
    VITE_API_URL: process.env.VITE_API_URL || '',
    VITE_OTEL_EXPORTER_OTLP_ENDPOINT: process.env.VITE_OTEL_EXPORTER_OTLP_ENDPOINT || '',
  });
});

/* --------------------- TRAY ROUTES --------------------- */

// Get all trays
SERVER_APPLICATION.get(`${TRAY_URL_BASE}`, async (_req: Request, res: Response) => {
  const result = await SERVER_DB_POOL.query<Tray>('SELECT * FROM trays');
  res.json(result.rows);
});

// Get a specific tray
SERVER_APPLICATION.get(`${TRAY_URL_BASE}/:trayId`, async (req: Request, res: Response) => {
  const result = await SERVER_DB_POOL.query<Tray>('SELECT * FROM trays WHERE id = $1', [req.params.trayId]);
  result.rowCount ? res.json(result.rows[0]) : res.status(404).json({ error: 'Tray not found' });
});

// Add a new tray
SERVER_APPLICATION.post(`${TRAY_URL_BASE}`, async (req: Request, res: Response) => {
  const { name, location, rows, columns, notes } = req.body;
  const result = await SERVER_DB_POOL.query<Tray>(
    'INSERT INTO trays (name, location, rows, columns, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [name, location, rows, columns, notes]
  );
  res.json(result.rows[0]);
});

// Update a tray
SERVER_APPLICATION.put(`${TRAY_URL_BASE}/:trayId`, async (req: Request, res: Response) => {
  const { trayId } = req.params;
  const { name, location, rows, columns, notes } = req.body;
  await SERVER_DB_POOL.query(
    'UPDATE trays SET name = $1, location = $2, rows = $3, columns = $4, notes = $5 WHERE id = $6',
    [name, location, rows, columns, notes, trayId]
  );
  res.json({ success: true });
});

// Delete a tray
SERVER_APPLICATION.delete(`${TRAY_URL_BASE}/:trayId`, async (req: Request, res: Response) => {
  const { trayId } = req.params;
  await SERVER_DB_POOL.query('DELETE FROM tray_cells WHERE tray_id = $1', [trayId]);
  await SERVER_DB_POOL.query('DELETE FROM trays WHERE id = $1', [trayId]);
  res.json({ success: true });
});

/* --------------------- PLANT ROUTES --------------------- */

// Get all plants
SERVER_APPLICATION.get(`${PLANTS_URL_BASE}`, async (_req: Request, res: Response) => {
  const result = await SERVER_DB_POOL.query<Plant>(`
        SELECT p.id, p.name, p.variety, s.genus, s.species, p.days_to_germinate, p.days_to_harvest
        FROM plants p
        JOIN species s ON p.species_id = s.id;
    `);
  res.json(result.rows);
});

// Get a specific plant
SERVER_APPLICATION.get(`${PLANTS_URL_BASE}/:plantId`, async (req: Request, res: Response) => {
  const result = await SERVER_DB_POOL.query<Plant>('SELECT * FROM plants WHERE id = $1', [req.params.plantId]);
  result.rowCount ? res.json(result.rows[0]) : res.status(404).json({ error: 'Plant not found' });
});

// Add a new plant
SERVER_APPLICATION.post(`${PLANTS_URL_BASE}`, async (req: Request, res: Response) => {
  const { species_id, name, variety, days_to_germinate, days_to_harvest } = req.body;
  const result = await SERVER_DB_POOL.query<Plant>(
    'INSERT INTO plants (species_id, name, variety, days_to_germinate, days_to_harvest) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [species_id, name, variety, days_to_germinate, days_to_harvest]
  );
  res.json(result.rows[0]);
});

// Delete a plant
SERVER_APPLICATION.delete(`${PLANTS_URL_BASE}/:plantId`, async (req: Request, res: Response) => {
  const { plantId } = req.params;
  await SERVER_DB_POOL.query('DELETE FROM tray_cells WHERE plant_id = $1', [plantId]);
  await SERVER_DB_POOL.query('DELETE FROM plants WHERE id = $1', [plantId]);
  res.json({ success: true });
});

/* --------------------- CELL ROUTES --------------------- */

// Get all cells for a tray
SERVER_APPLICATION.get(`${TRAY_URL_BASE}/:trayId/cells`, async (req: Request, res: Response) => {
  const result = await SERVER_DB_POOL.query<TrayCell>(
    `SELECT tray_cells.*, plants.name AS plant_name, plants.variety
          FROM tray_cells
          LEFT JOIN plants ON tray_cells.plant_id = plants.id
          WHERE tray_cells.tray_id = $1`,
    [req.params.trayId]
  );
  res.json(result.rows);
});

// Assign a plant to a cell
SERVER_APPLICATION.post(`${TRAY_URL_BASE}/:trayId/cells`, async (req: Request, res: Response) => {
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
});

/* --------------------- CALENDAR ROUTES --------------------- */

// Get seeding calendar
SERVER_APPLICATION.get(`${CALENDARS_URL_BASE}`, async (_req, res) => {
  const result = await SERVER_DB_POOL.query(`
      SELECT tc.tray_id, t.name AS tray_name, p.name AS plant_name, 
          p.days_to_germinate, p.days_to_harvest, tc.planted_date
      FROM tray_cells tc
      JOIN trays t ON tc.tray_id = t.id
      JOIN plants p ON tc.plant_id = p.id;
  `);

  const calendar = result.rows.map(row => ({
    tray_name: row.tray_name,
    plant_name: row.plant_name,
    planted_date: row.planted_date,
    germination_date: new Date(row.planted_date).toISOString().split("T")[0],
    harvest_date: new Date(row.planted_date).toISOString().split("T")[0]
  }));

  res.json(calendar);
});


/* --------------------- SPECIES ROUTES --------------------- */

// Get all species
SERVER_APPLICATION.get(`${SPECIES_URL_BASE}`, async (_req: Request, res: Response) => {
  const result = await SERVER_DB_POOL.query<Species>('SELECT * FROM species ORDER BY genus, species');
  res.json(result.rows);
});

// Add a new species
SERVER_APPLICATION.post(`${SPECIES_URL_BASE}`, async (req: Request, res: Response) => {
  const { genus, species } = req.body;
  const result = await SERVER_DB_POOL.query<Species>(
    'INSERT INTO species (genus, species) VALUES ($1, $2) RETURNING *',
    [genus, species]
  );
  res.json(result.rows[0]);
});

SERVER_APPLICATION.use(express.static("./.local/vite/dist"));

/* --------------------- SERVER START --------------------- */

const server = createServer();
server.on("request", SERVER_APPLICATION);
server.listen(SERVER_PORT, "127.0.0.1", () => {
  console.log(`API running on localhost:${SERVER_PORT}`);
});





