<?php
//-------------------------------------------------
// saveLevel.php – Unified cloud save handler
// Supports autosave (rotating 0–9) & manual saves
//-------------------------------------------------
require_once __DIR__ . '/../../includes/json.header.php';
require_once __DIR__ . '/../../includes/jest.client.php';

//-------------------------
// Auth check
//-------------------------
$user = $_SESSION['user'] ?? null;
if ( !$user || !isset($user['id']) ) {
	client()->respond( 401, 'unauthorized', null, 'Login required.' );
	exit;
}
$user_id = (int) $user['id'];

//-------------------------
// Parse input
//-------------------------
$in               = client()->input() ?? [];
$level_name       = $in['level_name'] ?? null;			// [string] filename / display name
$save_type        = $in['save_type'] ?? 'manual';		// 'manual' | 'auto'
$data_raw         = $in['data'] ?? null;				// [string] full file payload (your level text/JSON)
$cloud_id         = isset($in['cloud_id']) ? (int)$in['cloud_id'] : null; // [int|null]
$if_match_version = isset($in['if_match_version']) ? (int)$in['if_match_version'] : null; // [int|null]
$force            = !empty( $in['force'] );				// [bool] allow overwrite even if stale

if ( !$level_name || !$data_raw || ($save_type!=='manual' && $save_type!=='auto') ) {
	client()->respond(
		400, 'invalid',
		null, 'Missing level_name/data or bad save_type.' );
	exit;
}

$pdo = client()->mysql->pdo;

//-------------------------
// Helper: find existing by id
//-------------------------
$findById = function( $id ) use ( $pdo, $user_id ) {
	$q = $pdo->prepare(
		"SELECT id, user_id, level_name, save_type, version
		 FROM user_level_saves
		 WHERE id=?
		 	AND user_id=?
		 LIMIT 1");
	$q->execute( [ $id, $user_id ] );
	return $q->fetch( PDO::FETCH_ASSOC );
};

//-------------------------
// Helper: find existing by (user, filename) for manuals
//-------------------------
$findByName = function( $name ) use ( $pdo, $user_id ) {
	$q	= $pdo->prepare(
		"SELECT id, version
		 FROM user_level_saves
		 WHERE
		 	user_id=?
		 	AND
			level_name=?
			AND
			save_type='manual'
		 LIMIT 1" );
	$q->execute( [ $user_id, $name ] );
	return $q->fetch( PDO::FETCH_ASSOC );
};

//-------------------------------------------------
// CASE A: Update existing row by cloud_id
//-------------------------------------------------
if ( $cloud_id ) {
	$row = $findById( $cloud_id );
	if ( !$row ) {
		client()->respond( 404, 'not_found', null, 'Cloud save not found.' );
		exit;
	}

	// Version guard
	$server_version = (int)$row['version'];
	if ( $if_match_version===null ) {
		client()->respond(
			409, 'conflict',
			[
				'reason' => 'missing_version',
				'server_version' => $server_version
			],
			'Client version missing.' );
		exit;
	}
	if ( $if_match_version!==$server_version && !$force ) {
		client()->respond(
			409, 'conflict',
			[
				'reason' => 'version_mismatch',
				'server_version' => $server_version,
				'client_version' => $if_match_version
			],
			'Cloud file is newer. Overwrite or Fork?' );
		exit;
	}

	// Accept write (overwrite if forced or matched)
	$new_version = $server_version + 1;
	$upd = $pdo->prepare("
		UPDATE user_level_saves
		SET data=?, version=?, saved_at=NOW(), level_name=?
		WHERE id=?
			AND user_id=?
		");
	$upd->execute( [ $data_raw, $new_version, $level_name, $cloud_id, $user_id ] );

	client()->respond(
		200, 'success',
		[
			'id'      => (int) $cloud_id,
			'version' => $new_version,
			'level'   => $level_name
		],
		'Saved.' );
	exit;
}

//-------------------------------------------------
// CASE B: No cloud_id → create or bind by filename (manual only)
//   (Autos can either create fresh rows or be skipped; your call.)
//-------------------------------------------------
if ( $save_type==='manual' ) {
	$existing = $findByName( $level_name );
	if ( $existing ) {
		// A manual cloud file with the same filename already exists
		client()->respond(
			409, 'conflict',
			[
				'reason'     => 'name_in_use',
				'existing'   => [ 'id'=>(int)$existing['id'], 'version'=>(int)$existing['version'] ],
				'suggestion' => 'bind_or_fork'
			],
			'A cloud file with this filename already exists.
			Bind to it or choose a new name to fork.');
		exit;
	}

	// Create fresh manual row
	$ins = $pdo->prepare("
		INSERT INTO user_level_saves (user_id, level_name, save_type, version, data, saved_at)
		VALUES ( ?, ?, 'manual', 0, ?, NOW() )
		");
	$ins->execute( [ $user_id, $level_name, $data_raw ] );
	$new_id = (int) $pdo->lastInsertId();

	client()->respond(
		200, 'success',
		[
			'id'      => $new_id,
			'version' => 0,
			'level'   => $level_name
		],
		'Created new cloud save.' );
	exit;
}

//-------------------------------------------------
// CASE C: No cloud_id + auto save → either create a row or ignore
// If you want autos to create rows, uncomment below.
//-------------------------------------------------
/*
$insA = $pdo->prepare("
	INSERT INTO user_level_saves (user_id, level_name, save_type, version, data, saved_at)
	VALUES (?, ?, 'auto', 0, ?, NOW())
");
$insA->execute([ $user_id, $level_name, $data_raw ]);
$new_idA = (int)$pdo->lastInsertId();
client()->respond(200, 'success', [ 'id'=>$new_idA, 'version'=>0, 'level'=>$level_name ], 'Created auto row.');
exit;
*/

client()->respond( 400, 'invalid', null, 'Unhandled save mode.' );

exit;
