console.log( 'jestAlert: js/apps/jest/clients/plugins/creator/jest/parsers/jani/sprite.plugin.js loaded' );

(function( window ) {
	// Define the plugin [object]
	var type	= 'keyword';
	var subtype	= 'SPRITE';

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
			Klass.keywords.add( 'SPRITE' );

			//------------------------
			// PARSER
			//------------------------
			Klass.registerKeywordParser(
				subtype,
				function ( ctx, lines, i, result ) {
					// Split each part of the line by space-key
					const line		= lines[i];
					const parts		= line.split( /\s+/ );
					// Parse & create new AnimationSprite [object]
					const sprite	=
						new AnimationSprite(
							parseInt( parts[1] ),		// ID
							parts[2],					// Group
							parts.slice(7).join(' '),	// Label (e.g., 'shadow', 'shield up')
							parseInt( parts[3] ),		// Source x
							parseInt( parts[4] ),		// Source y
							parseInt( parts[5] ),		// Width
							parseInt( parts[6] )		// Height
							);
					// Ensure [array] of sprites exists.
					if ( !result.sprites )
						result.sprites	= [];
					result.sprites.push( sprite ); // add sprite
					// Add the sprite group.
					if ( !result.groups )
						result.groups	= new Set();
					result.groups.add( sprite.group );
					return i+1;
				}
			);

			//------------------------
			// ENCODER
			//------------------------
			Klass.registerKeywordEncoder(
				subtype,
				function ( ctx, sprites ) {
					if ( !sprites ) return [];
					return sprites.map(
						sp => `SPRITE ${sp.id} ${sp.group} ${sp.x} ${sp.y} ${sp.w} ${sp.h} ${sp.label}`
						);
				}
			);
		}
	};

	// register with JestParserJani class
	if ( typeof window.JestParserJani?.use==='function' )
		window.JestParserJani.use( type, plugin );
	else console.error( 'sprite.plugin.js load error: JestParserJani.use() not found' );
})( window );
