<?php

//-------------------------
// Gamepiece Class
//-------------------------
// Create a gamepiece part of the Jest application.
class Gamepiece {
	// Object propert(ies)
	public $client;		// [object] Jest application client.

	//-------------------------
	// Constructor
	//-------------------------
	// Initializes the module.
	// * $client	- [object] Jest application owning the gamepiece.
	public function __construct( $client ) {
		// Store client reference in [object].
		$this->client	= $client;
	}
}

?>
