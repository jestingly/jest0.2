console.log( 'jestAlert: js/apps/jest/components/editing/JestEasel.js loaded' );

//-----------------------------
// JestEasel Class
//-----------------------------
// Holds and manages multiple JestFileView [object] instances.
// Views are stored and accessed by their unique `.skey`.
// Provides .showcase(), .takedown(), .getView() methods.
class JestEasel extends OSObject {
	// Object Properties
	views		= {};			// [object] skey → JestFileView

	//--------------------------------
	// Constructor
	//--------------------------------
	// RETURNS: [void]
	// * client – [object] reference to main app/client
	constructor( client ) {
		super( client ); // call base constructor
	}

	//--------------------------------
	// Add a View to Easel (Showcase)
	//--------------------------------
	// Stores a view internally by its `.skey`.
	// RETURNS: [bool] true if added
	// * view	– [JestFileView] instance to add
	showcase( view ) {
		// Sanity check
		if ( !view || typeof view.skey!=='string' ) return false;
		// Store view under .skey
		this.views[view.skey] = view;
		return true;
	}

	//--------------------------------
	// Remove a View from Easel (Takedown)
	//--------------------------------
	// Removes a view from internal collection using its `.skey`.
	// RETURNS: [bool] true if removed
	// * viewOrKey	– [JestFileView|string]
	takedown( viewOrKey ) {
		const key = (typeof viewOrKey==='string') ? viewOrKey : viewOrKey?.skey;
		if ( !key || !this.views[key] ) return false;
		delete this.views[key];
		return true;
	}

	//--------------------------------
	// Retrieve a View from Easel
	//--------------------------------
	// Gets a view stored by its skey.
	// RETURNS: [JestFileView|null]
	// * skey	– [string] system key
	getView( skey ) {
		// If view exists, return it (else [null]).
		return this.views[skey] ?? null;
	}

	//--------------------------------
	// Get All Views
	//--------------------------------
	// Returns shallow copy of all tracked views.
	// RETURNS: [object] skey → JestFileView
	getAll() {
		return Object.assign( {}, this.views );
	}
}
