-- Drop existing tables if they exist (Cascade ensures references are removed)
DROP TABLE IF EXISTS tray_cells, plants, species, trays CASCADE;

-- Create species table (Genus / Species)
CREATE TABLE species (
    id SERIAL PRIMARY KEY,
    genus TEXT NOT NULL,
    species TEXT NOT NULL,
    UNIQUE(genus, species)
);

-- Create plants table (Custom Name, Variety, Linked to Species)
CREATE TABLE plants (
    id SERIAL PRIMARY KEY,
    species_id INTEGER NOT NULL,
    name TEXT NOT NULL,  -- Custom plant name
    variety TEXT NOT NULL, -- Variety like "Bell Boy"
    days_to_germinate INTEGER,
    days_to_harvest INTEGER,
    UNIQUE(species_id, variety, name, days_to_germinate, days_to_harvest),
    FOREIGN KEY (species_id) REFERENCES species(id) ON DELETE CASCADE
);

-- Create trays table
CREATE TABLE trays (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    rows INTEGER,
    columns INTEGER,
    notes TEXT,
    UNIQUE(name, location, rows, columns)
);

-- Create tray cells table (plants assigned to tray locations)
CREATE TABLE tray_cells (
    id SERIAL PRIMARY KEY,
    tray_id INTEGER NOT NULL,
    x INTEGER NOT NULL,
    y INTEGER NOT NULL,
    plant_id INTEGER,
    planted_date DATE DEFAULT CURRENT_DATE,
    UNIQUE(tray_id, x, y),
    FOREIGN KEY (tray_id) REFERENCES trays(id) ON DELETE CASCADE,
    FOREIGN KEY (plant_id) REFERENCES plants(id) ON DELETE SET NULL
);

-- Insert example species
INSERT INTO species (genus, species) VALUES 
    ('Capsicum', 'annuum'), 
    ('Solanum', 'lycopersicum'), 
    ('Lactuca', 'sativa');

-- Insert example plants
INSERT INTO plants (species_id, name, variety, days_to_germinate, days_to_harvest) VALUES
    ((SELECT id FROM species WHERE genus = 'Capsicum' AND species = 'annuum'), 'Bell Pepper - My Crop', 'Bell Boy', 7, 75),
    ((SELECT id FROM species WHERE genus = 'Capsicum' AND species = 'annuum'), 'Sweet Pepper', 'California Wonder', 10, 80),
    ((SELECT id FROM species WHERE genus = 'Solanum' AND species = 'lycopersicum'), 'Tomato', 'San Marzano', 6, 85),
    ((SELECT id FROM species WHERE genus = 'Lactuca' AND species = 'sativa'), 'Lettuce', 'Romaine', 4, 60);

-- Insert example trays
INSERT INTO trays (name, location, rows, columns, notes) VALUES 
    ('Greenhouse A', 'West Wing', 5, 10, 'For early growth'),
    ('Outdoor Bed 1', 'East Garden', 4, 8, 'Needs full sun');

-- Insert example tray cells (Assigning plants to grid positions)
INSERT INTO tray_cells (tray_id, x, y, plant_id, planted_date) VALUES
    ((SELECT id FROM trays WHERE name = 'Greenhouse A'), 0, 0, (SELECT id FROM plants WHERE name = 'Bell Pepper - My Crop'), '2025-02-10'),
    ((SELECT id FROM trays WHERE name = 'Greenhouse A'), 1, 0, (SELECT id FROM plants WHERE name = 'Tomato'), '2025-02-11'),
    ((SELECT id FROM trays WHERE name = 'Outdoor Bed 1'), 0, 0, (SELECT id FROM plants WHERE name = 'Lettuce'), '2025-02-12');