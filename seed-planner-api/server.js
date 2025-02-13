require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { SimpleSpanProcessor } = require('@opentelemetry/sdk-trace-base');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const { ExpressInstrumentation } = require('@opentelemetry/instrumentation-express');
const { PgInstrumentation } = require('@opentelemetry/instrumentation-pg');

const app = express();
const port = process.env.PORT || 5000;

// PostgreSQL Connection using runtime environment variables
const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 5432,
});

// OpenTelemetry Configuration
const provider = new NodeTracerProvider();
const exporter = new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
});
provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
provider.register();

registerInstrumentations({
    instrumentations: [
        new ExpressInstrumentation(),
        new PgInstrumentation(),
    ],
});

app.use(cors());
app.use(express.json());

/* --------------------- FRONTEND CONFIG ROUTE --------------------- */
// Dynamically provide frontend with env vars at runtime
app.get('/config', (req, res) => {
    res.json({
        API_URL: process.env.API_URL || '',
        OTEL_EXPORTER_OTLP_ENDPOINT: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || '',
    });
});

/* --------------------- TRAY ROUTES --------------------- */

// Get all trays
app.get('/trays', async (req, res) => {
    const result = await pool.query('SELECT * FROM trays');
    res.json(result.rows);
});

// Get a specific tray
app.get('/trays/:trayId', async (req, res) => {
    const result = await pool.query('SELECT * FROM trays WHERE id = $1', [req.params.trayId]);
    result.rowCount ? res.json(result.rows[0]) : res.status(404).json({ error: "Tray not found" });
});

// Add a new tray
app.post('/trays', async (req, res) => {
    const { name, location, rows, columns, notes } = req.body;
    const result = await pool.query(
        'INSERT INTO trays (name, location, rows, columns, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [name, location, rows, columns, notes]
    );
    res.json(result.rows[0]);
});

// Update a tray
app.put('/trays/:trayId', async (req, res) => {
    const { trayId } = req.params;
    const { name, location, rows, columns, notes } = req.body;
    await pool.query(
        'UPDATE trays SET name = $1, location = $2, rows = $3, columns = $4, notes = $5 WHERE id = $6',
        [name, location, rows, columns, notes, trayId]
    );
    res.json({ success: true });
});

// Delete a tray (also removes assigned cells)
app.delete('/trays/:trayId', async (req, res) => {
    const { trayId } = req.params;
    await pool.query('DELETE FROM tray_cells WHERE tray_id = $1', [trayId]);
    await pool.query('DELETE FROM trays WHERE id = $1', [trayId]);
    res.json({ success: true });
});

/* --------------------- PLANT ROUTES --------------------- */

// Get all plants
app.get('/plants', async (req, res) => {
    const result = await pool.query(`
        SELECT p.id, p.name, p.variety, s.genus, s.species, p.days_to_germinate, p.days_to_harvest
        FROM plants p
        JOIN species s ON p.species_id = s.id;
    `);
    res.json(result.rows);
});

// Get a specific plant
app.get('/plants/:plantId', async (req, res) => {
    const result = await pool.query('SELECT * FROM plants WHERE id = $1', [req.params.plantId]);
    result.rowCount ? res.json(result.rows[0]) : res.status(404).json({ error: "Plant not found" });
});

// Add a new plant
app.post('/plants', async (req, res) => {
    const { species_id, name, variety, days_to_germinate, days_to_harvest } = req.body;
    const result = await pool.query(
        'INSERT INTO plants (species_id, name, variety, days_to_germinate, days_to_harvest) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [species_id, name, variety, days_to_germinate, days_to_harvest]
    );
    res.json(result.rows[0]);
});

// Update a plant
app.put('/plants/:plantId', async (req, res) => {
    const { plantId } = req.params;
    const { name, variety, days_to_germinate, days_to_harvest } = req.body;
    await pool.query(
        'UPDATE plants SET name = $1, variety = $2, days_to_germinate = $3, days_to_harvest = $4 WHERE id = $5',
        [name, variety, days_to_germinate, days_to_harvest, plantId]
    );
    res.json({ success: true });
});

// Delete a plant (also removes from assigned cells)
app.delete('/plants/:plantId', async (req, res) => {
    const { plantId } = req.params;
    await pool.query('DELETE FROM tray_cells WHERE plant_id = $1', [plantId]);
    await pool.query('DELETE FROM plants WHERE id = $1', [plantId]);
    res.json({ success: true });
});

/* --------------------- CELL ASSIGNMENT ROUTES --------------------- */

// Get all cells for a tray
app.get('/trays/:trayId/cells', async (req, res) => {
    const result = await pool.query(`
        SELECT tray_cells.*, plants.name AS plant_name, plants.variety
        FROM tray_cells
        LEFT JOIN plants ON tray_cells.plant_id = plants.id
        WHERE tray_cells.tray_id = $1
    `, [req.params.trayId]);
    res.json(result.rows);
});

// Assign a plant to a cell
app.post('/trays/:trayId/cells', async (req, res) => {
    const { trayId } = req.params;
    const { x, y, plant_id } = req.body;

    await pool.query(`
        INSERT INTO tray_cells (tray_id, x, y, plant_id, planted_date)
        VALUES ($1, $2, $3, $4, CURRENT_DATE)
        ON CONFLICT (tray_id, x, y) DO UPDATE 
        SET plant_id = EXCLUDED.plant_id, planted_date = CURRENT_DATE
    `, [trayId, x, y, plant_id]);

    res.json({ success: true });
});

// Remove a plant from a cell (reset cell)
app.put('/trays/:trayId/cells/reset', async (req, res) => {
    const { trayId } = req.params;
    const { x, y } = req.body;
    await pool.query('UPDATE tray_cells SET plant_id = NULL WHERE tray_id = $1 AND x = $2 AND y = $3', [trayId, x, y]);
    res.json({ success: true });
});

/* --------------------- GRID & CALENDAR ROUTES --------------------- */

// Get structured tray grid
app.get('/trays/:trayId/grid', async (req, res) => {
    const { trayId } = req.params;

    const tray = await pool.query('SELECT * FROM trays WHERE id = $1', [trayId]);
    if (tray.rowCount === 0) return res.status(404).json({ error: "Tray not found" });

    const grid = await pool.query(`
        SELECT tray_cells.*, plants.name AS plant_name
        FROM tray_cells
        LEFT JOIN plants ON tray_cells.plant_id = plants.id
        WHERE tray_cells.tray_id = $1
    `, [trayId]);

    res.json({ tray: tray.rows[0], grid: grid.rows });
});

// Get seeding calendar
app.get('/calendar', async (req, res) => {
    const result = await pool.query(`
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
app.get("/species", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM species ORDER BY genus, species");
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching species:", error);
        res.status(500).json({ error: "Failed to fetch species" });
    }
});

// Add a new species
app.post("/species", async (req, res) => {
    const { genus, species } = req.body;
    try {
        const result = await pool.query(
            "INSERT INTO species (genus, species) VALUES ($1, $2) RETURNING *",
            [genus, species]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error adding species:", error);
        res.status(500).json({ error: "Failed to add species" });
    }
});

// Delete a species
app.delete("/species/:speciesId", async (req, res) => {
    const { speciesId } = req.params;
    try {
        await pool.query("DELETE FROM species WHERE id = $1", [speciesId]);
        res.json({ success: true });
    } catch (error) {
        console.error("Error deleting species:", error);
        res.status(500).json({ error: "Failed to delete species" });
    }
});

/* --------------------- SERVER START --------------------- */
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
