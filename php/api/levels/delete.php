<?php
//-------------------------------------------------
// deleteLevel.php – Deletes a saved level by ID
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
$id		= isset($_POST['id']) ? intval($_POST['id']) : 0;
if ( $id<=0 ) {
	client()->respond( 400, 'invalid', null, 'Invalid ID.' );
	exit;
}

//-------------------------
// Delete Entry
//-------------------------
$pdo	= client()->mysql->pdo;
$del	= $pdo->prepare("
	DELETE FROM user_level_saves
	WHERE id = ? AND user_id = ?
	");
$del->execute( [ $id, $user_id ] );

//-------------------------
// Response
//-------------------------
client()->respond( 200, 'success', [ 'deleted_id'=>$id ], 'Level deleted.' );
exit;
