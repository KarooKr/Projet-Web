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

$armeDelta = isset($_GET['armeDelta']) ? intval($_GET['armeDelta']) : 0;
$peupleDelta = isset($_GET['peupleDelta']) ? intval($_GET['peupleDelta']) : 0;
$argentDelta = isset($_GET['argentDelta']) ? intval($_GET['argentDelta']) : 0;
$religionDelta = isset($_GET['religionDelta']) ? intval($_GET['religionDelta']) : 0;

try {
    $stmt = $db->prepare('UPDATE joueur SET arme = arme + :armeDelta, peuple = peuple + :peupleDelta, argent = argent + :argentDelta, religion = religion + :religionDelta WHERE equipe = :equipe');
    if (!$stmt) {
        echo json_encode(['success' => false, 'error' => 'Erreur de préparation SQLite']);
        exit;
    }
    $stmt->bindValue(':armeDelta', $armeDelta, SQLITE3_INTEGER);
    $stmt->bindValue(':peupleDelta', $peupleDelta, SQLITE3_INTEGER);
    $stmt->bindValue(':argentDelta', $argentDelta, SQLITE3_INTEGER);
    $stmt->bindValue(':religionDelta', $religionDelta, SQLITE3_INTEGER);
    $stmt->bindValue(':equipe', $equipe, SQLITE3_TEXT);

    $result = $stmt->execute();
    if ($result === false) {
        echo json_encode(['success' => false, 'error' => 'Impossible de mettre à jour les ressources']);
        exit;
    }

    $stmt = $db->prepare('SELECT arme, peuple, argent, religion FROM joueur WHERE equipe = :equipe');
    if (!$stmt) {
        echo json_encode(['success' => false, 'error' => 'Erreur de préparation SQLite']);
        exit;
    }
    $stmt->bindValue(':equipe', $equipe, SQLITE3_TEXT);
    $result = $stmt->execute();
    if (!$result) {
        echo json_encode(['success' => false, 'error' => 'Impossible de lire les ressources']);
        exit;
    }
    $resources = $result->fetchArray(SQLITE3_ASSOC);
    if (!$resources) {
        echo json_encode(['success' => false, 'error' => 'Joueur introuvable']);
        exit;
    }

    echo json_encode(['success' => true, 'resources' => $resources]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Erreur base de données']);
}
