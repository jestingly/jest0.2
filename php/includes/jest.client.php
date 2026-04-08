<?php

// Main include(s).
require_once __DIR__ . '/include.php';

//-------------------------
// Jest Class
//-------------------------
// Core CMS [object] class for handling all [objects].
class Jest {
	// Object propert(ies)
	public $config;		// [object] JestConfig for user system customization.
	public $mysql;		// [object] JestMySQL module for MySQL db interfacing.
	public $parser;		// [object] JestParser module for parsing data.
	public $user;		// [object] JestUser module for user recognition.
	public $auth;		// [object] JestAuth handler for user auth/registration.

	//-------------------------
	// Constructor
	//-------------------------
	// Initializes the client.
	public function __construct() {
		// Create configuration [object].
		$this->config	= new JestConfig( $this );
		// Begin MySQL connection.
		$this->mysql	= new JestMySQL( $this );
		// Create core parsing [object].
		$this->parser	= new JestParser( $this );
		// Begin user session.
		$this->user		= new JestUser( $this );
		// Begin user auth connection.
		$this->auth		= new JestAuth( $this );
	}

	//-------------------------
	// Response Handling
	//-------------------------
	// Receive a user message.
	// RETURNS: json [object].
	public function input() {
		//error_log( file_get_contents('php://input') );
		// Attempt to get the user input.
		return json_decode( file_get_contents('php://input'), true );
	}

	// Respond a message to the user.
	// * code		- [int] Status key for data return type (e.g. 200, 404)
	// * status		- [string] Value of response code (e.g. missing', 'corrupt').
	// * data		- [...] Data assigned to response report.
	// * message	- [string] Value of a response message.
	public function respond( $code, $status, $data=null, $message=null ) {
		//---------------------------
		// Return response as a JSON [string]
		//---------------------------
		// Generate return.
		$response	=
			[
			'code'=>$code, 'status'=>$status,
			'message'=>$message, 'data'=>$data
			];
		$parsed		= json_encode( $response ); // convert to json
		// Log parsed message in console.
		error_log( $parsed );
		// Echo the parsed response.
		echo $parsed; // parsed response
	}
}

//-------------------------
// Create JEST Client [object]
//-------------------------
// Core Jest [object] application client.
global $jest;
$jest	= new Jest();

// Swiftly get the client [object].
function client() {
	global $jest; // global instance
	return $jest; // return it
}

?>
