<?php
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(E_ALL);
header('Content-Type: application/json');
require_once __DIR__ . '/../db.php';

function jsonError($message) {
    echo json_encode(['success' => false, 'error' => $message]);
    exit;
}

function sqliteError($db) {
    return $db instanceof SQLite3 ? $db->lastErrorMsg() : 'Erreur SQLite inconnue';
}

function sanitizeEtat($etat) {
    $etat = strtolower(trim($etat));
    $allowed = ['rouge', 'bleu', 'transparent'];
    return in_array($etat, $allowed, true) ? $etat : 'transparent';
}

function sanitizeEquipe($equipe) {
    $equipe = strtolower(trim($equipe));
    return in_array($equipe, ['a', 'b'], true) ? $equipe : null;
}

$x = isset($_GET['x']) ? intval($_GET['x']) : 0;
$y = isset($_GET['y']) ? intval($_GET['y']) : 0;
$etat = isset($_GET['etat']) ? sanitizeEtat($_GET['etat']) : 'transparent';
$equipe = isset($_GET['equipe']) ? sanitizeEquipe($_GET['equipe']) : null;

if (!$equipe) {
    echo json_encode(['success' => false, 'error' => 'Équipe invalide']);
    exit;
}

try {
    if ($etat === 'transparent') {
        $stmt = $db->prepare('INSERT OR REPLACE INTO coordonnee (x, y, etat) VALUES (:x, :y, :etat)');
        if (!$stmt) {
            jsonError('Erreur prepare INSERT transparent: ' . sqliteError($db));
        }
        $stmt->bindValue(':x', $x, SQLITE3_INTEGER);
        $stmt->bindValue(':y', $y, SQLITE3_INTEGER);
        $stmt->bindValue(':etat', $etat, SQLITE3_TEXT);
        $result = $stmt->execute();

        if ($result) {
            echo json_encode(['success' => true, 'x' => $x, 'y' => $y, 'etat' => $etat]);
        } else {
            jsonError('Impossible de sauvegarder');
        }
        exit;
    }

    $req = $db->prepare('SELECT arme, peuple, argent, religion FROM joueur WHERE equipe = :equipe');
    if (!$req) {
        jsonError('Erreur prepare SELECT: ' . sqliteError($db));
    }
    $req->bindValue(':equipe', $equipe, SQLITE3_TEXT);
    $result = $req->execute();
    if (!$result) {
        jsonError('Erreur execute SELECT: ' . sqliteError($db));
    }
    $current = $result->fetchArray(SQLITE3_ASSOC);

    if (!$current) {
        jsonError('Joueur introuvable');
    }

    $cost = 10;
    $needed = ['arme' => $cost, 'peuple' => $cost, 'argent' => $cost, 'religion' => $cost];
    foreach ($needed as $field => $value) {
        if ($current[$field] < $value) {
            echo json_encode(['success' => false, 'error' => 'Ressources insuffisantes']);
            exit;
        }
    }

    $update = $db->prepare('UPDATE joueur SET arme = arme - :cost, peuple = peuple - :cost, argent = argent - :cost, religion = religion - :cost WHERE equipe = :equipe');
    if (!$update) {
        jsonError('Erreur prepare UPDATE: ' . sqliteError($db));
    }
    $update->bindValue(':cost', $cost, SQLITE3_INTEGER);
    $update->bindValue(':equipe', $equipe, SQLITE3_TEXT);
    if (!$update->execute()) {
        jsonError('Erreur execute UPDATE: ' . sqliteError($db));
    }

    $stmt = $db->prepare('INSERT OR REPLACE INTO coordonnee (x, y, etat) VALUES (:x, :y, :etat)');
    $stmt->bindValue(':x', $x, SQLITE3_INTEGER);
    $stmt->bindValue(':y', $y, SQLITE3_INTEGER);
    $stmt->bindValue(':etat', $etat, SQLITE3_TEXT);
    $result = $stmt->execute();

    if ($result) {
        $current['arme'] -= $cost;
        $current['peuple'] -= $cost;
        $current['argent'] -= $cost;
        $current['religion'] -= $cost;

        echo json_encode([
            'success' => true,
            'x' => $x,
            'y' => $y,
            'etat' => $etat,
            'equipe' => $equipe,
            'resources' => $current
        ]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Impossible de sauvegarder']);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Erreur base de données']);
}
