<?php
//----------------------------------------------
// check.php – Verifies active session login
//----------------------------------------------

//-------------------------------------------------
// CMS-compatible session check
//-------------------------------------------------
require_once __DIR__ . '/../json.header.php';	// Load JSON header definition
require_once __DIR__ . '/../jest.client.php';	// Load CMS root client

//-------------------------------------------------
// Respond with current login state
//-------------------------------------------------
// Determine if user is logged in.
$user	= client()->user->getUsername();		// Use CMS session helper
$code	= $user===null ? 400 : 200;				// not logged in
$status	= $user===null ? 'error' : 'success';	// not logged in
// Generate return response.
client()->respond(
	$code, $status,
	[
		'logged'	=> ( $user!==null ),
		'user'		=> $user
	]);

exit;
