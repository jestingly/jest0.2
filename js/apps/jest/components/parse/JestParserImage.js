//-------------------------------------------------------
// JEST ® All Rights Reserved
// Antago (God of Gravity), author of Graal2001 & Destiny
// Copyright ® 1999-2026
//-------------------------------------------------------
console.log( 'jestAlert: js/apps/jest/components/parse/JestParserImage.js loaded' );

//-------------------------
// JestParserImage Class
//-------------------------
// Parser for image blob structure.
class JestParserImage extends JestGamepiece {
	//-------------------------
	// Instantiation
	//-------------------------
	// Construct the [object].
	// * client		- [object] Application client that this piece belongs to.
	constructor( client ) {
		super( client );
	}

	//-------------------------
	// Image Parser
	//-------------------------
	// Parses a Image blob.
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

//----------------------------------
// Export globally
//----------------------------------
window.JestParserImage = JestParserImage;
