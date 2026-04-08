console.log( 'jestAlert: js/apps/jest/clients/plugins/creator/jest/parsers/level/cloud.plugin.js loaded' );

//-----------------------------
// CLOUD Block Plugin
//-----------------------------
// Parses `CLOUD ... CLOUDEND` blocks from level files.
// Format:
// CLOUD 0
// #type: manual|auto|local
// #cloud_id: 12345       	// may be absent before first bind
// #version: 12           	// last server version client believes it saved
// #timestamp: 2025-08-08T22:45:31Z
// CLOUDEND
//-----------------------------
(function( window ) {
	// Define the plugin [object]
	var type	= 'keyword';
	var subtype	= 'CLOUD';

	// Plugin definition
	var plugin	= {
		// Initialize the plugin.
		init: function( parser ) {
			// Get the client from parser.
			const client	= parser.client;
			if ( !client.is('tiler') ) return; // for tiler app
			// Register a pre-save event (level "save" file event) for preloading save data.
			client.cabinet.register(
				'presave', 'levelCloudMetaData',
				( file ) => {
					// Queue the file's level's meta cloud data to save.
					const meta	=  file.context?.meta || {};
					file.enqueue( 'cloud', meta );
				});
		},

		// Extend the client class.
		extend: function( Klass, proto ) {
			//--------------------------------
			// Decoder: Parse CLOUD block
			//--------------------------------
			Klass.registerKeywordParser(
				subtype,
				function( ctx, lines, i, result ) {
					const block = [];

					// Read from "CLOUD" to "CLOUDEND"
					let start = i;
					while ( i<lines.length && lines[i]!==`${subtype}END` ) {
						block.push( lines[i] );
						i++;
					}
					// Push final CLOUDEND line
					if ( i<lines.length )
						block.push( lines[i] );
					i++;

					// Parse block into map
					const map = {};
					for ( const line of block ) {
						if ( line.startsWith('#') ) {
							const [ k, ...rest ] = line.slice(1).split(':');
							map[k.trim()] = rest.join(':').trim();
						}
					}
					// Store result in `cloud` field
					if ( Object.keys(map).length>0 )
						result.cloud = map;

					return i; // return next line index
				});

			//--------------------------------
			// Encoder: Write CLOUD block
			//--------------------------------
			Klass.registerKeywordEncoder(
				subtype,
				function( ctx, data ) {
					if ( !data ) return [];
					const lines = [ `${subtype} 0` ]; // always start with CLOUD 0
					for ( let key in data )
						lines.push( `#${key}: ${data[key]}` );
					lines.push( `${subtype}END` );
					return lines;
				});
		}
	};

	// register with JestParserLevel class
	if ( typeof window.JestParserLevel?.use==='function' )
		window.JestParserLevel.use( type, plugin );
	else console.error( 'cloud.plugin.js load error: JestParserLevel.use() not found' );
})( window );
