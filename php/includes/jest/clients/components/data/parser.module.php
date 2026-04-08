<?php

//-------------------------
// JestParser Class
//-------------------------
// Utility class for validating/sanitizing JSON input arrays
// Used to prevent malformed or unsafe data from propagating
class JestParser extends Gamepiece {
	// Object propert(ies)

	//-------------------------
	// Constructor
	//-------------------------
	// Initializes the module.
	// * $client	- [object] Jest application owning the gamepiece.
	public function __construct( $client ) {
		// Call the parent constructor
		parent::__construct( $client );
	}

	//-------------------------
	// Static: Parse JSON Body
	//-------------------------
	// Reads raw php://input and decodes to [array].
	// RETURNS: [array|null] parsed input or null on error.
	public static function fromJSON() {
		$raw	= file_get_contents( 'php://input' );
		$data	= json_decode( $raw, true );

		return is_array($data) ? $data : null;
	}

	//-------------------------
	// Static: Require Fields
	//-------------------------
	// Validates presence of required keys in $data.
	// RETURNS: [bool] true if all fields exist, false otherwise.
	// * $data		- [array] input array
	// * $fields	- [array] list of required field names
	public static function hasFields( $data, $fields ) {
		// Iterate & check each field.
		foreach ( $fields as $field )
			if ( !isset($data[$field]) || $data[$field]==='' )
				return false;
		// All fields found.
		return true;
	}

	// Validates presence of required keys in $data.
	// RETURNS: [array] of missing field(s) if any.
	// * $data		- [array] input array
	// * $fields	- [array] list of required field names
	public static function missingFields( $data, $fields ) {
		// Create a return result for missing field(s).
		$response	= [];
		// Iterate & check each field.
		foreach ( $fields as $field ) {
			if ( !isset($data[$field]) || $data[$field]==='' )
				array_push( $response, $field );
		}
		// Return field(s) missing.
		return $response;
	}

	//-------------------------
	// Static: Sanitize User Data
	//-------------------------
	// Strips unwanted characters and trims strings.
	// RETURNS: [array] sanitized result
	// * $data		- [array] raw input
	// * $fields	- [array] fields to sanitize
	public static function sanitize( $data, $fields ) {
		$out = [];
		foreach ( $fields as $field ) {
			if ( isset($data[$field]) )
				$out[$field] = trim( strip_tags( $data[$field] ) );
			else $out[$field] = null;
		}
		// Return sanitzed output.
		return $out;
	}

	//-------------------------
	// Static: Validate Username
	//-------------------------
	// Basic validation of [username] format.
	// RETURNS: [bool] whether valid.
	// * $username - [string]
	public static function validateUsername( $username ) {
		return is_string($username) && preg_match('/^[a-zA-Z0-9_\-]{3,20}$/', $username);
	}

	//-------------------------
	// Static: Validate Email
	//-------------------------
	// Basic validation of [email] format.
	// RETURNS: [bool] whether valid.
	// * $email - [string]
	public static function validateEmail( $email ) {
		return is_string($email) && filter_var( $email, FILTER_VALIDATE_EMAIL );
	}

	//-------------------------
	// Static: Validate Password
	//-------------------------
	// Password rules: min 6 chars, at least 1 letter and 1 number.
	// RETURNS: [bool] whether valid.
	// * $password - [string]
	public static function validatePassword( $password ) {
		if ( !is_string($password) || strlen($password) < 6 ) return false;
		return preg_match('/[a-zA-Z]/', $password) && preg_match('/[0-9]/', $password);
	}

	//-------------------------
	// Static: Parse + Validate Credentials
	//-------------------------
	// Reads and validates a set of user fields.
	// RETURNS: [array|null] sanitized values or null on failure.
	// * $data   - [array] raw input
	// * $fields - [array] expected field names (ex: ['username','email','password'])
	public static function parseCredentials( $data, $fields ) {
		//--------------------------------
		// Validate required fields
		//--------------------------------
		error_log( gettype($data));
		$missing	= self::missingFields( $data, $fields );
		if ( count($missing)>0 ) return null;

		//--------------------------------
		// Sanitize all fields
		//--------------------------------
		$clean		= self::sanitize( $data, $fields );

		//--------------------------------
		// Field-specific validation (if exists)
		//--------------------------------
		// Create return [object].
		$response	= [];
		foreach ( $fields as $key ) {
			// Begin field return state.
			$spec	= [ 'status'=>'success', 'value'=>null ];
			// Insert response value about field.
			$spec['value']	= $clean[$key]; // default to field input value
			// Determine field & validate.
			switch ( $key ) {
				// Parse username.
				case 'username':
					// Validate the username.
					if ( !self::validateUsername($clean[$key]) ) {
						$spec['value']	= 'Must be alphanumeric, 3-20 characters long.';
						$spec['status']	= 'error';
					}
					break;
				// Parse email.
				case 'email':
					// Validate the email.
					if ( !self::validateEmail($clean[$key]) ) {
						$spec['value']	= 'Must be a valid e-mail address.';
						$spec['status']	= 'error';
					}
					break;
				// Parse password.
				case 'password':
					// Validate the password.
					if ( !self::validatePassword($clean[$key]) ) {
						$spec['value']	= 'Must be minimum 6 characters, at least 1 letter and 1 number.';
						$spec['status']	= 'error';
					}
					break;
			}
			// Store field specs in response.
			$response[$key] = $spec;
		}
		// Return the clean data.
		return $response;
	}
}

?>
