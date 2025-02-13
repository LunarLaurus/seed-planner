require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');

const app = express();
const port = process.env.PORT || 5000;
const db = new Database('./db/seed_planner.db');

app.use(cors());
app.use(express.json());

/* --------------------- TRAY ROUTES --------------------- */

// Get all trays
app.get('/trays', (req, res) => {
    res.json(db.prepare('SELECT * FROM trays').all());
});

// Get a specific tray
app.get('/trays/:trayId', (req, res) => {
    const tray = db.prepare('SELECT * FROM trays WHERE id = ?').get(req.params.trayId);
    tray ? res.json(tray) : res.status(404).json({ error: "Tray not found" });
});

// Add a new tray
app.post('/trays', (req, res) => {
    const { name, location, rows, columns, notes } = req.body;
    const result = db.prepare('INSERT INTO trays (name, location, rows, columns, notes) VALUES (?, ?, ?, ?, ?)').run(name, location, rows, columns, notes);
    res.json({ id: result.lastInsertRowid });
});

// Update a tray
app.put('/trays/:trayId', (req, res) => {
    const { trayId } = req.params;
    const { name, location, rows, columns, notes } = req.body;
    db.prepare('UPDATE trays SET name = ?, location = ?, rows = ?, columns = ?, notes = ? WHERE id = ?').run(name, location, rows, columns, notes, trayId);
    res.json({ success: true });
});

// Delete a tray (also removes assigned cells)
app.delete('/trays/:trayId', (req, res) => {
    const { trayId } = req.params;
    db.prepare('DELETE FROM tray_cells WHERE tray_id = ?').run(trayId);
    db.prepare('DELETE FROM trays WHERE id = ?').run(trayId);
    res.json({ success: true });
});

/* --------------------- PLANT ROUTES --------------------- */

// Get all plants
app.get('/plants', (req, res) => {
    res.json(db.prepare('SELECT * FROM plants').all());
});

// Get a specific plant
app.get('/plants/:plantId', (req, res) => {
    const plant = db.prepare('SELECT * FROM plants WHERE id = ?').get(req.params.plantId);
    plant ? res.json(plant) : res.status(404).json({ error: "Plant not found" });
});

// Add a new plant
app.post('/plants', (req, res) => {
    const { name, variety, days_to_germinate, days_to_harvest } = req.body;
    const result = db.prepare('INSERT INTO plants (name, variety, days_to_germinate, days_to_harvest) VALUES (?, ?, ?, ?)').run(name, variety, days_to_germinate, days_to_harvest);
    res.json({ id: result.lastInsertRowid });
});

// Update a plant
app.put('/plants/:plantId', (req, res) => {
    const { plantId } = req.params;
    const { name, variety, days_to_germinate, days_to_harvest } = req.body;
    db.prepare('UPDATE plants SET name = ?, variety = ?, days_to_germinate = ?, days_to_harvest = ? WHERE id = ?').run(name, variety, days_to_germinate, days_to_harvest, plantId);
    res.json({ success: true });
});

// Delete a plant (also removes from assigned cells)
app.delete('/plants/:plantId', (req, res) => {
    const { plantId } = req.params;
    db.prepare('DELETE FROM tray_cells WHERE plant_id = ?').run(plantId);
    db.prepare('DELETE FROM plants WHERE id = ?').run(plantId);
    res.json({ success: true });
});

/* --------------------- CELL ASSIGNMENT ROUTES --------------------- */

// Get all cells for a tray
app.get('/trays/:trayId/cells', (req, res) => {
    res.json(db.prepare(`
        SELECT tray_cells.*, plants.name AS plant_name, plants.variety
        FROM tray_cells
        LEFT JOIN plants ON tray_cells.plant_id = plants.id
        WHERE tray_cells.tray_id = ?
    `).all(req.params.trayId));
});

// Assign a plant to a cell
app.post('/trays/:trayId/cells', (req, res) => {
    const { trayId } = req.params;
    const { x, y, plant_id } = req.body;

    if (!plant_id) {
        return res.status(400).json({ error: "No plant ID provided" });
    }

    console.log(`Assigning plant ${plant_id} to tray ${trayId} at (${x}, ${y})`);

    const stmt = db.prepare(`
        INSERT INTO tray_cells (tray_id, x, y, plant_id, planted_date)
        VALUES (?, ?, ?, ?, CURRENT_DATE)
        ON CONFLICT(tray_id, x, y) DO UPDATE SET plant_id = excluded.plant_id, planted_date = CURRENT_DATE
    `);
    
    try {
        stmt.run(trayId, x, y, plant_id);
        res.json({ success: true });
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ error: "Failed to assign plant" });
    }
});

// Remove a plant from a cell (reset cell)
app.put('/trays/:trayId/cells/reset', (req, res) => {
    const { trayId } = req.params;
    const { x, y } = req.body;
    db.prepare('UPDATE tray_cells SET plant_id = NULL WHERE tray_id = ? AND x = ? AND y = ?').run(trayId, x, y);
    res.json({ success: true });
});

/* --------------------- GRID & CALENDAR ROUTES --------------------- */

// Get a structured tray grid
app.get('/trays/:trayId/grid', (req, res) => {
    const { trayId } = req.params;

    const tray = db.prepare('SELECT * FROM trays WHERE id = ?').get(trayId);
    if (!tray) return res.status(404).json({ error: "Tray not found" });

    const cells = db.prepare(`
        SELECT tray_cells.*, plants.name AS plant_name
        FROM tray_cells
        LEFT JOIN plants ON tray_cells.plant_id = plants.id
        WHERE tray_cells.tray_id = ?
    `).all(trayId);

    res.json({ tray, grid: cells });
});

// Get seeding calendar
app.get('/calendar', (req, res) => {
    const today = new Date().toISOString().split("T")[0];

    const events = db.prepare(`
        SELECT tray_cells.*, plants.name AS plant_name, plants.days_to_germinate, plants.days_to_harvest
        FROM tray_cells
        JOIN plants ON tray_cells.plant_id = plants.id
    `).all();

    const calendarEvents = events.map(event => {
        const plantedDate = new Date(event.planted_date);
        const germinationDate = new Date(plantedDate);
        germinationDate.setDate(plantedDate.getDate() + event.days_to_germinate);

        const harvestDate = new Date(plantedDate);
        harvestDate.setDate(plantedDate.getDate() + event.days_to_harvest);

        return {
            tray_name: `Tray ${event.tray_id}`,
            plant_name: event.plant_name,
            planted_date: plantedDate.toISOString().split("T")[0],
            germination_date: germinationDate.toISOString().split("T")[0],
            harvest_date: harvestDate.toISOString().split("T")[0],
        };
    });

    res.json(calendarEvents);
});

/* --------------------- SERVER START --------------------- */
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});