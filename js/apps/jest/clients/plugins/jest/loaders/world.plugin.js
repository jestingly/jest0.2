//-------------------------------------------------------
// JEST ® All Rights Reserved
// Antago (God of Gravity), author of Graal2001 & Destiny
// Copyright ® 1999-2026
//-------------------------------------------------------
console.log( 'jestAlert: js/apps/jest/clients/plugins/creator/jest/loaders/world.plugin.js loaded' );

// World loader plugin.
(function( window ) {
	// Define the plugin [object]
	var type	= 'loaders';
	var subtype	= 'world';
	var plugin	= {
		// Initialize the plugin.
		init: function( client ) { },

		// Extend the client class.
		extend: function( Klass, proto ) {
			// Add game-world load method.
			// RETURNS: [bool] success.
			// * stem	- [string] Filename (without extension).
			proto.loadWorldData = async function( stem ) {
				//--------------------------------
				// Validate Argument(s)
				//--------------------------------
				// Validate argument(s)
				if ( !stem ) {
					console.warn( 'Cannot Read File: Supplied argument is empty!' );
					return false;
				}
				//--------------------------------
				// Attempt to Download Data
				//--------------------------------
				// Use the Secretary to download a world file's preset data.
				console.log( `Attempting to download world file preset data...` );
				console.log( stem );
				const ok	= await this.secretary.loadFile( stem );
				if ( !ok ) {
					console.warn( `Could not download file data.` );
					return false;
				}
				else console.log( `Remote game-world file data read successfully!` );
				return true; // successfully loaded
			};
		}
	};
	// register with application
	if ( window.Jest && typeof window.Jest.use==='function' )
		window.Jest.use( type, plugin );
	else console.error( 'world.plugin.js load error: Jest.use() not found' );
})( window );
