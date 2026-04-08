<?php

//-------------------------
// JestUser Class
//-------------------------
// Begins session & stores logged username.
class JestUser extends Gamepiece {
	// Object propert(ies)
	public $user;		// [string|null] Value of user's login username.

	//-------------------------
	// Constructor
	//-------------------------
	// Initializes the module.
	// * $client	- [object] Jest application owning the gamepiece.
	public function __construct( $client ) {
		// Call the parent constructor
		parent::__construct( $client );
		$this->sessionStart();	// begin session
		$this->authenticate();	// authenticate user
	}

	//-------------------------
	// Session Method(s)
	//-------------------------
	// Begin a data session with user.
	// RETURNS: [void].
	public function sessionStart() {
		session_start(); // begin session
	}

	//-------------------------
	// Session Method(s)
	//-------------------------
	// Begin a data session with user.
	// RETURNS: [void].
	public function sessionDestroy() {
		session_destroy(); // end session
		// Reset username.
		$this->user	= null;
	}

	// Authenticate user.
	// RETURNS: [string|null] username.
	public function authenticate() {
		// Check for session username.
		$this->user	= $_SESSION['user'] ?? null;
		return $this->user; // return username
	}

	// Determine if user is logged in.
	// RETURNS: [string] username or [null].
	public function getUsername() {
		// Return username or attempt to get it if not recognized.
		return $this->user ?? $this->authenticate();
	}
}

?>
