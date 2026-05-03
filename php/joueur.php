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
    $stmt = $db->prepare('SELECT equipe, arme, peuple, argent, religion FROM joueur WHERE equipe = :equipe');
    if (!$stmt) {
        echo json_encode(['success' => false, 'error' => 'Erreur de préparation SQLite : ' . $db->lastErrorMsg()]);
        exit;
    }
    $stmt->bindValue(':equipe', $equipe, SQLITE3_TEXT);
    $result = $stmt->execute();
    if (!$result) {
        echo json_encode(['success' => false, 'error' => 'Erreur d’exécution SQLite : ' . $db->lastErrorMsg()]);
        exit;
    }
    $data = $result->fetchArray(SQLITE3_ASSOC);

    if (!$data) {
        echo json_encode(['success' => false, 'error' => 'Joueur introuvable']);
        exit;
    }

    $data['success'] = true;
    echo json_encode($data);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Erreur base de données']);
}
