<?php
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(E_ALL);
header('Content-Type: application/json');
require_once __DIR__ . '/../db.php';

try {
    $result = $db->query('SELECT tour, winner FROM nombre_de_tour WHERE id = 1');
    $row = $result ? $result->fetchArray(SQLITE3_ASSOC) : false;

    if (!$row) {
        $db->exec("INSERT OR IGNORE INTO nombre_de_tour (id, tour, ready_a, ready_b, winner) VALUES (1, 1, 0, 0, NULL)");
        $row = ['tour' => 1, 'winner' => null];
    }

    echo json_encode([
        'success' => true,
        'tour' => intval($row['tour']),
        'winner' => $row['winner'] !== null ? $row['winner'] : null
    ]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Erreur base de données']);
}
