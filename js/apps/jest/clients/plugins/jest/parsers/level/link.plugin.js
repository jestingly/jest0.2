console.log( 'jestAlert: js/apps/jest/clients/plugins/creator/jest/parsers/level/link.plugin.js loaded' );

//-----------------------------
// LINK Block Plugin
//-----------------------------
// JSON parser plugin.
(function( window ) {
	// Define the plugin [object]
	var type	= 'keyword';
	var subtype	= 'LINK';

	// Plugin definition
	var plugin	= {
		// Initialize the plugin.
		init: function( parser ) {
			// Get the client from parser.
			const client	= parser.client;
			if ( !client.is('tiler') ) return; // for tiler app
			// Register a pre-save event (level "save" file event) for preloading save data.
			client.cabinet.register(
				'presave', 'levelMarqueeCuratorLinkItems',
				( file ) => {
					// Get the level marquee's curator.
					const curator	= client.toolbox.tools.levelMarquee.curators.primary;
					// Queue warp zone regions (to save to file).
					const warpObjs	= curator.getVisibleObjects( 'warp' );
					file.enqueue( 'link', warpObjs );
				});
		},

		// Extend the client class.
		extend: function( Klass, proto ) {
			//--------------------------------
			// Decoder: Parse LINK block
			//--------------------------------
			Klass.registerKeywordParser(
				subtype,
				function( ctx, lines, i, result ) {
					const tokens = lines[i].trim().split( /\s+/ );
					if ( tokens.length<8 ) {
						console.warn( `${subtype} parse error: Invalid LINK line: ${lines[i]}` );
						return i + 1;
					}

					const link = {
						level	: tokens[1],
						x		: parseFloat( tokens[2] ),
						y		: parseFloat( tokens[3] ),
						w		: parseFloat( tokens[4] ),
						h		: parseFloat( tokens[5] ),
						dx		: tokens[6]==='playerx' ? 'playerx' : parseFloat( tokens[6] ),
						dy		: tokens[7]==='playery' ? 'playery' : parseFloat( tokens[7] )
						};

					// Decode whitespace (for file parsing integrity)
					const keys = [ 'level', 'x', 'y', 'w', 'h', 'dx', 'dy' ];
					for ( const key of keys )
						link[key] = ctx.client.decodeWhitespace( link[key] );

					const key = subtype.toLowerCase(); // "link"
					if ( !result[key] ) result[key] = [];
					result[key].push( link );

					return i + 1;
				});

			//--------------------------------
			// Encoder: Write LINK block
			//--------------------------------
			Klass.registerKeywordEncoder(
				subtype,
				function( ctx, links=[] ) {
					const lines = [];
					// Iterate each link object & parse its data.
					for ( const item of links ) {
						// Encode whitespace (for file parsing integrity)
						const encode = [ 'level', 'x', 'y', 'w', 'h', 'dx', 'dy' ];
						let out = { ...item.data };
						for ( const key of encode )
							out[key] = ctx.client.encodeWhitespace( out[key] );
						// Required fields: target, x, y, w, h
						lines.push( `LINK ${out.level} ${out.x} ${out.y} ${out.w} ${out.h} ${out.dx} ${out.dy}` );
					}
					// Add LINK line.
					return lines;
				});
		}
	};

	// Register plugin with JestParserLevel
	if ( typeof window.JestParserLevel?.use==='function' )
		window.JestParserLevel.use( type, plugin );
	else console.error( 'link.plugin.js load error: JestParserLevel.use() not found' );
})( window );
