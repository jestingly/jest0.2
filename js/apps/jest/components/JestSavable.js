console.log( 'jestAlert: js/apps/jest/components/JestSavable.js loaded' );

//-------------------------
// JestSavable Class
//-------------------------
// A class that indicates an [object] is savable with built-in methods for saving.
class JestSavable extends JestMatrix {
	// Lexical declaration(s)
	name		= null;					// [string] value of savable [object] name.

	//-------------------------
	// Constructor
	//-------------------------
	// Initializes the savable [object].
	// * client		- [object] Application client that this piece belongs to.
	// * name		- [string] Value of user username (e.g. 'Antago').
	constructor( client, name ) {
		super( client );				// construct the parent
		this.setName( name );			// set the savable [object] name
		// Set status to initialized
		this.jot( 'status', 'initialized' );
	}

	//-------------------------
	// Lexical Handling
	//-------------------------
	// Change the name of the [object] (used for filename).
	// RETURNS: [boolean] `true` on success else `false` on fail.
	// * name		- [string] Value of new name.
	setName( name ) {
		// Validate & set name
		this.name	= jsos.prove(name,'string') ? name : 'unnamed';
		return true;
	}

	//-------------------------
	// Load Data
	//-------------------------
	// Load the [object] data.
	// RETURNS: [boolean] `true` on success else `false` on fail.
	load() {
		// Determine logic based upon requested status change
		const currentMode = this.skim( 'status' );
		if ( currentMode!=='initialized' ) {
			this.jot( 'status', 'loading' );
		}
		// Emit the load start event
		this.emit( 'load' );
		return true;
	}
	
	// Complete the [object] data.
	// RETURNS: [boolean] `true` on success else `false` on fail.
	complete() {
		// Determine logic based upon requested status change
		const currentMode = this.skim( 'status' );
		if ( currentMode!=='loading' ) {
			this.jot( 'status', 'complete' );
		}
		// Emit the load complete event
		this.emit( 'complete' );
		return true;
	}
}
