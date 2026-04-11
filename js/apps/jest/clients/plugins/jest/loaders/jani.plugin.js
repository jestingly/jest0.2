//-------------------------------------------------------
// JEST ® All Rights Reserved
// Antago (God of Gravity), author of Graal2001 & Destiny
// Copyright ® 1999-2026
//-------------------------------------------------------
console.log( 'jestAlert: js/apps/jest/clients/plugins/creator/jest/loaders/jani.plugin.js loaded' );

// Jani loader plugin.
(function( window ) {
	// Define the plugin [object]
	var type	= 'loaders';
	var subtype	= 'jani';
	var plugin	= {
		// Initialize the plugin.
		init: function( client ) { },

		// Extend the client class.
		extend: function( Klass, proto ) {
			// Add jani load method.
			// RETURNS: [bool] success.
			// * fileInfo	- File information [object].
			proto.readJaniData = async function( fileInfo ) {
				console.log( fileInfo );
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
				console.log( `Attempting to read local jani file data...` );
				console.log( fileInfo );
				const ok	= await this.secretary.readFile( fileInfo );
				if ( !ok ) {
					console.warn( `Could not read jani file data.` );
					return false;
				}
				else console.log( `Local jani file data read successfully!` );
				return true; // successfully loaded
			};
		}
	};
	// register with application
	if ( window.Jest && typeof window.Jest.use==='function' )
		window.Jest.use( type, plugin );
	else console.error( 'jani.plugin.js load error: Jest.use() not found' );
})( window );
