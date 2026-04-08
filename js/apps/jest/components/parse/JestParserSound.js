console.log( 'jestAlert: js/apps/jest/components/parse/JestParserSound.js loaded' );

//-------------------------
// JestParserSound Class
//-------------------------
class JestParserSound extends JestGamepiece {
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
	// RETURNS: [object] { blob: data }
	// [object] with properties: { data: fileContent }.
	parse( { name, data: fileContent } ) {
		// Require file content to be of type [blob].
		if ( !(fileContent instanceof Blob) ) {
			console.error( 'Expected [object] Blob data, but got:', fileContent );
			return null;
		}
		// Return validated [object]
		return { blob: fileContent };
	}
}
