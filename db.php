<?php
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(E_ALL);

if (!class_exists('SQLite3')) {
    if (!headers_sent()) {
        header('Content-Type: application/json');
    }
    echo json_encode(['success' => false, 'error' => 'Extension SQLite3 manquante']);
    exit;
}

try {
    $db = new SQLite3(__DIR__ . '/database.db');
} catch (Exception $e) {
    if (!headers_sent()) {
        header('Content-Type: application/json');
    }
    echo json_encode(['success' => false, 'error' => 'Impossible d’ouvrir la base de données']);
    exit;
}

$db->exec("CREATE TABLE IF NOT EXISTS coordonnee (
    x INTEGER,
    y INTEGER,
    etat VARCHAR(20),
    PRIMARY KEY (x, y)
)");

$db->exec("CREATE TABLE IF NOT EXISTS nombre_de_tour (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tour INTEGER,
    ready_a INTEGER DEFAULT 0,
    ready_b INTEGER DEFAULT 0,
    winner VARCHAR(1)
)");

$turnColumns = [];
$result = $db->query("PRAGMA table_info(nombre_de_tour)");
while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
    $turnColumns[$row['name']] = true;
}
if (!isset($turnColumns['ready_a'])) {
    $db->exec("ALTER TABLE nombre_de_tour ADD COLUMN ready_a INTEGER DEFAULT 0");
}
if (!isset($turnColumns['ready_b'])) {
    $db->exec("ALTER TABLE nombre_de_tour ADD COLUMN ready_b INTEGER DEFAULT 0");
}
if (!isset($turnColumns['winner'])) {
    $db->exec("ALTER TABLE nombre_de_tour ADD COLUMN winner VARCHAR(1)");
}
$db->exec("INSERT OR IGNORE INTO nombre_de_tour (id, tour, ready_a, ready_b) VALUES (1, 1, 0, 0)");

$db->exec("CREATE TABLE IF NOT EXISTS joueur (
    equipe VARCHAR(1) PRIMARY KEY,
    arme INTEGER,
    peuple INTEGER,
    argent INTEGER,
    religion INTEGER
)");

$columns = [];
$result = $db->query("PRAGMA table_info(joueur)");
while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
    $columns[$row['name']] = true;
}

if (!isset($columns['equipe'])) {
    $db->exec("ALTER TABLE joueur ADD COLUMN equipe VARCHAR(1)");
}
if (!isset($columns['arme'])) {
    $db->exec("ALTER TABLE joueur ADD COLUMN arme INTEGER DEFAULT 0");
}
if (!isset($columns['peuple'])) {
    $db->exec("ALTER TABLE joueur ADD COLUMN peuple INTEGER DEFAULT 0");
}
if (!isset($columns['argent'])) {
    $db->exec("ALTER TABLE joueur ADD COLUMN argent INTEGER DEFAULT 0");
}
if (!isset($columns['religion'])) {
    $db->exec("ALTER TABLE joueur ADD COLUMN religion INTEGER DEFAULT 0");
}

$db->exec("INSERT OR IGNORE INTO joueur (equipe, arme, peuple, argent, religion) VALUES ('a', 50, 50, 50, 50)");
$db->exec("INSERT OR IGNORE INTO joueur (equipe, arme, peuple, argent, religion) VALUES ('b', 50, 50, 50, 50)");
?>