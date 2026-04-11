//-------------------------------------------------------
// JEST ® All Rights Reserved
// Antago (God of Gravity), author of Graal2001 & Destiny
// Copyright ® 1999-2026
//-------------------------------------------------------
console.log( 'jestAlert: js/apps/jest/clients/plugins/creator/jest/parsers/jani/attr.plugin.js loaded' );

(function( window ) {
	// Define the plugin [object]
	var type	= 'keyword';
	var subtype	= 'ATTR';

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
			Klass.keywords.add( 'ATTR' );
			Klass.keywords.add( 'ATTREND' );

			//------------------------
			// PARSER
			//------------------------
			Klass.registerKeywordParser(
				subtype,
				function ( ctx, lines, i, result ) {
					const attrs = {};
					i++; // skip ATTR

					while ( i<lines.length && lines[i]!=='ATTREND' ) {
						const line = lines[i].trim();
						if ( line ) {
							const [k,...rest] = line.split( ':' );
							attrs[k.trim()] = rest.join(':').trim();
						}
						i++;
					}
					i++; // skip ATTREND

					result.attr = attrs;
					return i;
				}
			);

			//------------------------
			// ENCODER
			//------------------------
			Klass.registerKeywordEncoder(
				subtype,
				function ( ctx, attrs ) {
					if ( !attrs ) return [];
					const lines = [ 'ATTR' ];
					for ( const k of attrs )
						lines.push( `${k}: ${attrs[k]}` );
					lines.push( 'ATTREND' );
					return lines;
				}
			);
		}
	};

	// register with JestParserJani class
	if ( typeof window.JestParserJani?.use==='function' )
		window.JestParserJani.use( type, plugin );
	else console.error( 'attr.plugin.js load error: JestParserJani.use() not found' );
})( window );
