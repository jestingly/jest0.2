//-------------------------------------------------------
// JEST ® All Rights Reserved
// Antago (God of Gravity), author of Graal2001 & Destiny
// Copyright ® 1999-2026
//-------------------------------------------------------
console.log( 'jestAlert: js/apps/jest/clients/plugins/creator/jest/parsers/JestParserJson.js loaded' );

//-------------------------
// JestParserJson Class
//-------------------------
// Receives loaded text/plain [string] & parses it into JSON [object] data.
class JestParserJson extends JestGamepiece {
	// Declare properties

	//-------------------------
	// Instantiation
	//-------------------------
	// Construct the [object].
	// RETURNS: [void].
	// * client				- Client [object] that this piece belongs to.
	constructor(client ) {
		super( client ); // call parent constructor
	}

	//-------------------------
	// Initialization Methods
	//-------------------------
	// Parse audio blob retrieved from JestSecretary.
	// RETURNS: [object|null]
	// [object] with properties: { data: fileContent }.
	// - * name		- [string] file name (optional)
	// - * data		- [string|object] JSON string or already-parsed object
	parse( { name='unnamed', data } ) {
		// Check if data is correct type.
		if ( typeof data==='object' && data!==null )
			return data; // already parsed
		// Data must be of type string.
		if ( typeof data==='string' ) {
			try {
				// Attempt to parse the data into a JSON [object].
				return JSON.parse( data ); // return parsed data
			}
			catch ( err ) {
				console.error(
					`JestParserJson.parse(): Failed to parse JSON from '${name}' @ JestParserJson.js`,
					err
					);
				return null;
			}
		}
		// Throw error (json failed to parse)
		console.error(
			`JestParserJson.parse(): Unsupported data type from '${name}' @ JestParserJson.js — type was:`,
			typeof data
			);
		return null; // return empty
	}
}
