console.log( 'jestAlert: js/apps/jest/clients/plugins/creator/jest/parsers/level/npc.plugin.js loaded' );

//-----------------------------
// NPC Block Plugin
//-----------------------------
// JSON parser plugin.
(function( window ) {
	// Define the plugin [object]
	var type	= 'keyword';
	var subtype	= 'NPC';

	// Plugin definition
	var plugin	= {
		// Initialize the plugin.
		init: function( parser ) {
			// Get the client from parser.
			const client	= parser.client;
			if ( !client.is('tiler') ) return; // for tiler app
		},

		// Extend the client class.
		extend: function( Klass, proto ) {
			//-------------------------
			// NPC Parsing (Decoding)
			//-------------------------
			Klass.registerKeywordParser(
				subtype,
				function( ctx, lines, i, result ) {
					const tokens = lines[i].trim().split( /\s+/ );
					if ( tokens.length<4 ) {
						console.warn( `${subtype} parse error: Invalid NPC header: ${lines[i]}` );
						return i + 1;
					}

					const npcId	= tokens[1]==='-' ? null : tokens[1];
					const x		= parseFloat( tokens[2] );
					const y		= parseFloat( tokens[3] );
					i++;

					const codeLines = [];
					while ( i<lines.length && lines[i].trim()!==`${subtype}END` )
						codeLines.push( lines[i++] );
					if ( i<lines.length && lines[i].trim()===`${subtype}END` ) i++;

					const key = subtype.toLowerCase(); // "npc"
					if ( !result[key] ) result[key] = [];
					result[key].push({
						id		: npcId,
						x		: x,
						y		: y,
						code	: codeLines.join('\n')
						});

					return i;
				});

			//-------------------------
			// Encode NPC Block
			//-------------------------
			Klass.registerKeywordEncoder(
				subtype,
				function( ctx, npcs = [] ) {
					const lines = [];
					// Iterate each NPC script & encode it.
					for ( const npc of npcs ) {
						const id = npc.id || '-';
						lines.push( `NPC ${id} ${npc.x} ${npc.y}` );

						if ( npc.code )
							lines.push( ...npc.code.split( /\r?\n/ ) );

						lines.push( `NPCEND` );
					}
					return lines;
				});
		}
	};

	// Register plugin with JestParserLevel
	if ( typeof window.JestParserLevel?.use==='function' )
		window.JestParserLevel.use( type, plugin );
	else console.error( 'npc.plugin.js load error: JestParserLevel.use() not found' );
})( window );
