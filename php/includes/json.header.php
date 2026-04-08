<?php

$dev = true;
if ( $dev===false ) {
	//---------------------------
	// Suppress all PHP errors
	//---------------------------
	ini_set('display_errors', 0);
	ini_set('display_startup_errors', 0);
	error_reporting(0);

	//---------------------------
	// Output will be JSON
	//---------------------------
	header('Content-Type: application/json');
}

?>
