<?php
//-------------------------------------------------
// logout.php — CMS-compatible logout handler
//-------------------------------------------------
require_once __DIR__ . '/../json.header.php';	// Load JSON header definition
require_once __DIR__ . '/../jest.client.php';	// Load CMS root client

//-------------------------------------------------
// Destroy session (via CMS session handler)
//-------------------------------------------------
client()->user->sessionDestroy();	// end user login session

//-------------------------------------------------
// Respond with logout confirmation
//-------------------------------------------------
client()->respond( 200, 'success' );

exit;
