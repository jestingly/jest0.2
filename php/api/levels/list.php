<?php
//-------------------------------------------------
// listLevelSaves.php – Lists all saves for user
//-------------------------------------------------

require_once __DIR__ . '/../../includes/json.header.php';
require_once __DIR__ . '/../../includes/jest.client.php';

//-------------------------
// Auth Check
//-------------------------
$user = $_SESSION['user'] ?? null;
if ( !$user || !isset($user['id']) ) {
	client()->respond( 401, 'unauthorized', null, 'Login required.' );
	exit;
}
$user_id = $user['id'];

//-------------------------
// Load Saves
//-------------------------
$pdo	= client()->mysql->pdo;
$stmt	= $pdo->prepare("
	SELECT id, level_name, save_type, version, note, saved_at
	FROM user_level_saves
	WHERE user_id = ?
	ORDER BY level_name, save_type, version ASC, saved_at DESC
	");
$stmt->execute( [ $user_id ] );
$saves	= $stmt->fetchAll( PDO::FETCH_ASSOC );

//-------------------------
// Respond With Save List
//-------------------------
client()->respond( 200, 'success', [ 'saves'=>$saves ] );
exit;
