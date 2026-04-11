//-------------------------------------------------------
// JEST ® All Rights Reserved
// Antago (God of Gravity), author of Graal2001 & Destiny
// Copyright ® 1999-2026
//-------------------------------------------------------
console.log( 'jestAlert: js/apps/jest/clients/plugins/creator/jest/parsers/jani/opts.plugin.js loaded' );

(function( window ) {
	// Define the plugin [object]
	var type	= 'keyword';
	var subtype	= 'OPTS';

	// Plugin definition
	var plugin	= {
		// Initialize the plugin.
		init: function( parser ) {
			// Get the client from parser.
			const client	= parser.client;
			if ( !client.is('animator') ) return; // for animator app
		},

		// Extend the client class.
		extend: function( Klass, proto ) {
			//------------------------
			// REGISTER KEYWORDS
			//------------------------
			Klass.keywords.add( 'OPTS' );
			Klass.keywords.add( 'OPTSEND' );

			//------------------------
			// PARSER
			//------------------------
			Klass.registerKeywordParser(
				subtype,
				function ( ctx, lines, i, result ) {
					const opts = {};
					i++; // skip "OPTS"

					while ( i<lines.length && lines[i].trim()!=='OPTSEND' ) {
						const line = lines[i].trim();
						if ( line ) {
							const parts	= line.split( /\s+/ );
							if ( parts.length===1 )
								opts[parts[0]] = true;
							else if ( parts.length===2 )
								opts[parts[0]] = parts[1];
						}
						i++;
					}
					i++; // skip OPTSEND

					// Container for final key/value pairs
					const defaults = {};
					// Loop through keys
					for( const key in opts ) {
						// Only match prefix DEFAULT
						if( key.startsWith('DEFAULT') ) {
							// Remove the prefix
							const trimmed = key.substring( 'DEFAULT'.length );
							// Convert NAME patterns like ATTRIBUTE or HEAD etc:
							// DEFAULTHEAD -> HEAD
							// DEFAULTATTR1 -> ATTR1
							// DEFAULTBODY -> BODY
							defaults[ trimmed ] = opts[ key ];
						}
					}

					// Retain default value(s) & option(s).
					result.defaults	= defaults;
					result.opts		= opts;
					return i;
				}
			);

			//------------------------
			// ENCODER
			//------------------------
			Klass.registerKeywordEncoder(
				subtype,
				function ( ctx, opts ) {
					if ( !opts ) return [];
					const lines	= [ 'OPTS' ];
					for ( const key in opts )
						lines.push( `${key} ${opts[key]}` );
					lines.push( 'OPTSEND' );
					return lines;
				}
			);
		}
	};

	// register with JestParserJani class
	if ( typeof window.JestParserJani?.use==='function' )
		window.JestParserJani.use( type, plugin );
	else console.error( 'opts.plugin.js load error: JestParserJani.use() not found' );
})( window );
