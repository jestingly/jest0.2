//-------------------------------------------------------
// JEST ® All Rights Reserved
// Antago (God of Gravity), author of Graal2001 & Destiny
// Copyright ® 1999-2026
//-------------------------------------------------------
console.log( 'jestAlert: js/apps/jest/clients/plugins/creator/jest/parsers/level/sign.plugin.js loaded' );

//-----------------------------
// SIGN Block Plugin
//-----------------------------
// JSON parser plugin.
(function( window ) {
	// Define the plugin [object]
	var type	= 'keyword';
	var subtype	= 'SIGN';

	// Plugin definition
	var plugin	= {
		// Initialize the plugin.
		init: function( parser ) {
			// Get the client from parser.
			const client	= parser.client;
			if ( !client.is('tiler') ) return; // for tiler app
			// Register a pre-save event (level "save" file event) for preloading save data.
			client.cabinet.register(
				'presave', 'levelMarqueeCuratorSignItems',
				( file ) => {
					// Get the level marquee's curator.
					const curator	= client.toolbox.tools.levelMarquee.curators.primary;
					// Queue readable sign regions (to save to file).
					const signObjs	= curator.getVisibleObjects( 'sign' );
					file.enqueue( 'sign', signObjs );
				});
		},

		// Extend the client class.
		extend: function( Klass, proto ) {
			// Method to decode CLOUD block data regions from a level file.
			Klass.registerKeywordParser(
				subtype,
				function( ctx, lines, i, result ) {
					const header	= lines[i].trim();
					const tokens	= header.split(/\s+/);
					if ( tokens.length<3 ) {
						console.warn( `${subtype} parse error: Invalid ${subtype} header: ${header}` );
						return i+1;
					}

					const x		= parseFloat( tokens[1] );
					const y		= parseFloat( tokens[2] );
					const w		= tokens.length>3 ? parseFloat(tokens[3]) : 2;
					const h		= tokens.length>4 ? parseFloat(tokens[4]) : 1;
					const name	= tokens.length>5 ? tokens[5] : 'sign';

					// Read multiline dialog until SIGNEND
					let dialogLines = [];
					i++;
					while ( i<lines.length && lines[i].trim()!==`${subtype}END` ) {
						dialogLines.push( lines[i] );
						i++;
					}
					if ( i<lines.length && lines[i].trim()===`${subtype}END` ) i++; // skip SIGNEND

					// Generate sign data & push into "signs" stack.
					const sign	= {
						x, y, w, h, name,
						dialog: dialogLines.join('\n')
						};

					// Decode whitespace for compatibility
					const decode = [ 'x', 'y', 'w', 'h', 'name' ];
					for ( const key of decode )
						sign[key] = ctx.client.decodeWhitespace( sign[key] );

					// Push into result
					const key = subtype.toLowerCase(); // "sign"
					if ( !result[key] ) result[key] = [];
					result[key].push( sign );
					return i;
				});

			// Register SIGN encoder
			Klass.registerKeywordEncoder(
				subtype,
				function( ctx, signs=[] ) {
					const lines = [];
					// Iterate each sign object & parse its data.
					for ( const item of signs ) {
						// Encode whitespace (for file parsing integrity)
						const encode	= [ 'x', 'y', 'w', 'h', 'name' ];
						let sign		= { ...item.data };
						for ( const key of encode )
							sign[key]	= ctx.client.encodeWhitespace( sign[key] );
						// Header (coordinates, dimensions, name)
						lines.push( `${subtype} ${sign.x} ${sign.y} ${sign.w} ${sign.h} ${sign.name}` );
						// Dialog
						if ( sign.dialog ) {
							const dialogLines = sign.dialog.split( /\r?\n/ );
							lines.push( ...dialogLines );
						}
						// Terminator
						lines.push( `${subtype}END` );
					}
					// Return encoded line(s).
					return lines;
				});
		}
	};

	// Register plugin with JestParserLevel
	if ( typeof window.JestParserLevel?.use==='function' )
		window.JestParserLevel.use( type, plugin );
	else console.error( 'sign.plugin.js load error: JestParserLevel.use() not found' );
})( window );
