<?php
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(E_ALL);
header('Content-Type: application/json');
require_once __DIR__ . '/../db.php';

try {
    $result = $db->query('SELECT x, y, etat FROM coordonnee');
    $rows = [];
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        $rows[] = $row;
    }
    echo json_encode($rows);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Erreur base de données']);
}

