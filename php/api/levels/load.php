<?php
//-------------------------------------------------
// loadLevel.php – Loads a saved level by ID
//-------------------------------------------------

require_once __DIR__ . '/../../includes/json.header.php';
require_once __DIR__ . '/../../includes/jest.client.php';

//-------------------------
// Auth Check
//-------------------------
$user	= $_SESSION['user'] ?? null;
if ( !$user || !isset($user['id']) ) {
	client()->respond( 401, 'unauthorized', null, 'Login required.' );
	exit;
}
$user_id = $user['id'];

//-------------------------
// Parse ID
//-------------------------
$id		= isset($_GET['id']) ? intval($_GET['id']) : 0;
if ( $id<=0 ) {
	client()->respond( 400, 'invalid', null, 'Missing or invalid save ID.' );
	exit;
}

//-------------------------
// Load Save Entry
//-------------------------
$pdo	= client()->mysql->pdo;
$stmt	= $pdo->prepare("
	SELECT id, level_name, save_type, version, note, saved_at, data
	FROM user_level_saves
	WHERE id = ? AND user_id = ?
	LIMIT 1
	");
$stmt->execute( [ $id, $user_id ] );
$row	= $stmt->fetch( PDO::FETCH_ASSOC );

if ( !$row ) {
	client()->respond( 404, 'not_found', null, 'Save not found.' );
	exit;
}

//-------------------------
// Success Response
//-------------------------
client()->respond( 200, 'success', $row );
exit;
