console.log( 'jestAlert: js/apps/jest/clients/plugins/creator/jest/loaders/level.plugin.js loaded' );

// Level loader plugin.
(function( window ) {
	// Define the plugin [object]
	var type	= 'loaders';
	var subtype	= 'level';
	var plugin	= {
		// Initialize the plugin.
		init: function( client ) { },

		// Extend the client class.
		extend: function( Klass, proto ) {
			// Add level load method.
			// RETURNS: [bool] success.
			// * fileInfo	- File information [object].
			proto.readLevelData = async function( fileInfo ) {
				//--------------------------------
				// Validate Argument(s)
				//--------------------------------
				// Validate argument(s)
				if ( !fileInfo ) {
					console.warn( 'Cannot Read File: Supplied argument is empty!' );
					return false;
				}
				//--------------------------------
				// Attempt to Load Data
				//--------------------------------
				// Use the Secretary to read a local file's data.
				console.log( `Attempting to read local level file data...` );
				console.log( fileInfo );
				const ok	= await this.secretary.readFile( fileInfo );
				if ( !ok ) {
					console.warn( `Could not read level file data.` );
					return false;
				}
				else console.log( `Local level file data read successfully!` );
				return true; // successfully loaded
			};
		}
	};
	// register with application
	if ( window.Jest && typeof window.Jest.use==='function' )
		window.Jest.use( type, plugin );
	else console.error( 'level.plugin.js load error: Jest.use() not found' );
})( window );
