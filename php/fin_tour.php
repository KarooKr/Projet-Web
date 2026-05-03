<?php
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(E_ALL);
header('Content-Type: application/json');
require_once __DIR__ . '/../db.php';

$equipe = isset($_GET['equipe']) ? strtolower(trim($_GET['equipe'])) : null;
if (!in_array($equipe, ['a', 'b'], true)) {
    echo json_encode(['success' => false, 'error' => 'Équipe invalide']);
    exit;
}

try {
    $db->exec("INSERT OR IGNORE INTO nombre_de_tour (id, tour) VALUES (1, 1)");

    $success = $db->exec("UPDATE nombre_de_tour SET tour = tour + 1 WHERE id = 1");
    if (!$success) {
        echo json_encode(['success' => false, 'error' => 'Impossible de terminer le tour']);
        exit;
    }

    $result = $db->query('SELECT tour FROM nombre_de_tour WHERE id = 1');
    $row = $result ? $result->fetchArray(SQLITE3_ASSOC) : false;

    if (!$row) {
        echo json_encode(['success' => false, 'error' => 'Impossible de lire le nombre de tours']);
        exit;
    }

    echo json_encode([
        'success' => true,
        'tour' => intval($row['tour'])
    ]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Erreur base de données']);
}
