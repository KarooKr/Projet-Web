<?php
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(E_ALL);
header('Content-Type: application/json');
require_once __DIR__ . '/../db.php';

$winner = isset($_GET['winner']) ? strtolower(trim($_GET['winner'])) : null;
if (!in_array($winner, ['a', 'b'], true)) {
    echo json_encode(['success' => false, 'error' => 'Joueur invalide']);
    exit;
}

try {
    $db->exec("INSERT OR IGNORE INTO nombre_de_tour (id, tour, ready_a, ready_b, winner) VALUES (1, 1, 0, 0, NULL)");
    $stmt = $db->prepare('UPDATE nombre_de_tour SET winner = :winner WHERE id = 1');
    $stmt->bindValue(':winner', $winner, SQLITE3_TEXT);
    if (!$stmt->execute()) {
        echo json_encode(['success' => false, 'error' => 'Impossible de déclarer le gagnant']);
        exit;
    }

    echo json_encode(['success' => true, 'winner' => $winner]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Erreur base de données']);
}
