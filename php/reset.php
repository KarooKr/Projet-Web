<?php
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(E_ALL);
header('Content-Type: application/json');
require_once __DIR__ . '/../db.php';

$input = json_decode(file_get_contents('php://input'), true);
$equipe = isset($input['equipe']) ? strtolower(trim($input['equipe'])) : null;
if (!in_array($equipe, ['a', 'b'], true)) {
    echo json_encode(['success' => false, 'error' => 'equipe invalide']);
    exit;
}

$defaultRed = isset($input['defaultRed']) && is_array($input['defaultRed']) ? $input['defaultRed'] : [];
$defaultBlue = isset($input['defaultBlue']) && is_array($input['defaultBlue']) ? $input['defaultBlue'] : [];

function parseCase($case) {
    if (is_string($case) && preg_match('/^(\d+)[_,-](\d+)$/', $case, $m)) {
        return ['x' => intval($m[1]), 'y' => intval($m[2])];
    }
    if (is_array($case) && isset($case['x'], $case['y'])) {
        return ['x' => intval($case['x']), 'y' => intval($case['y'])];
    }
    return null;
}

try {
    $db->exec('DELETE FROM coordonnee');
    $db->exec("UPDATE joueur SET arme = 50, peuple = 50, argent = 50, religion = 50");
    $db->exec("INSERT OR REPLACE INTO nombre_de_tour (id, tour, ready_a, ready_b, winner) VALUES (1, 1, 0, 0, NULL)");

    $insert = $db->prepare('INSERT INTO coordonnee (x, y, etat) VALUES (:x, :y, :etat)');
    if ($insert) {
        foreach ($defaultRed as $case) {
            $pos = parseCase($case);
            if (!$pos) continue;
            $insert->bindValue(':x', $pos['x'], SQLITE3_INTEGER);
            $insert->bindValue(':y', $pos['y'], SQLITE3_INTEGER);
            $insert->bindValue(':etat', 'rouge', SQLITE3_TEXT);
            $insert->execute();
        }
        foreach ($defaultBlue as $case) {
            $pos = parseCase($case);
            if (!$pos) continue;
            $insert->bindValue(':x', $pos['x'], SQLITE3_INTEGER);
            $insert->bindValue(':y', $pos['y'], SQLITE3_INTEGER);
            $insert->bindValue(':etat', 'bleu', SQLITE3_TEXT);
            $insert->execute();
        }
    }

    $response = ['success' => true];
    $stmt = $db->prepare('SELECT equipe, arme, peuple, argent, religion FROM joueur WHERE equipe = :equipe');
    if ($stmt) {
        $stmt->bindValue(':equipe', $equipe, SQLITE3_TEXT);
        $result = $stmt->execute();
        if ($result && ($data = $result->fetchArray(SQLITE3_ASSOC))) {
            $response['resources'] = $data;
        }
    }
    echo json_encode($response);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'db error']);
}
