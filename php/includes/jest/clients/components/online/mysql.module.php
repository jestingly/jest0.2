<?php

//-------------------------
// JestMySQL Class
//-------------------------
// Begins MySQL connection & interfaces with database.
class JestMySQL extends Gamepiece {
	// Object propert(ies)
	public $pdo;		// [object] PDO active database connection

	//-------------------------
	// Constructor
	//-------------------------
	// Initializes the module.
	// * $client	- [object] Jest application owning the gamepiece.
	public function __construct( $client ) {
		// Call the parent constructor
		parent::__construct( $client );
		// Attempt to call MySQL db & establish connection.
		$this->connect(); // connect to db
	}

	//-------------------------
	// Connection Method(s)
	//-------------------------
	// Begin a MySQL db connection.
	// RETURNS: [void].
	public function connect() {
		try {
			// Create PDO database connection.
			$config	= $this->client->config; // grab system configuration
			$pdo	=
				new PDO(
					"mysql:host={$config->DB_HOST};dbname={$config->DB_NAME}",
					$config->DB_USER, $config->DB_PASS
					);
			$pdo->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );
			// Keep PDO reference.
			$this->pdo	= $pdo; // keep ref
		}
		catch ( Exception $except ) {
			die( 'DB Error: '.$except->getMessage() );
		}
	}
}

?>
