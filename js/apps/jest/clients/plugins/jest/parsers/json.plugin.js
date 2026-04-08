console.log( 'jestAlert: js/apps/jest/clients/plugins/creator/jest/parsers/json.plugin.js loaded' );

// JSON parser plugin.
(function( window ) {
	// Define the plugin [object]
	var type	= 'parsers';
	var subtype	= 'json';
	var plugin	= {
		// Initialize the plugin.
		init: function( client ) {
			// Add new recognized file type inside the secretary.
			client.secretary.addFiletype( // json filetype handler
				'json', { extension: 'json', parse: 'json' } );
			client.parsers[subtype] = new JestParserJson( this );
		},
		// Extend the client class.
		extend: function( Klass, proto ) { }
	};
	// register with JEST® Application
	if ( window.Jest && typeof window.Jest.use==='function' )
		window.Jest.use( type, plugin );
	else console.error( 'json.plugin.js load error: Jest.use() not found' );
})( window );
