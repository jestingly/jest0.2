console.log( 'jestAlert: js/apps/jest/clients/plugins/creator/jest/parsers/jani/ani.plugin.js loaded' );

(function( window ) {
	// Define the plugin [object]
	var type	= 'keyword';
	var subtype	= 'ANI';

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
			Klass.keywords.add( 'ANI' );
			Klass.keywords.add( 'ANIEND' );

			//------------------------
			// PARSER
			//------------------------
			Klass.registerKeywordParser(
				subtype,
				function ( ctx, lines, i, result ) {
					//-------------------------------
					// Declare Variable(s)
					//-------------------------------
					// Get current list of generated sprites.
					const ani		= result.animation; // [AnimationAnimation]
					const sprites	= result.sprites || []; // current generated sprites
					const frames	= [];	// container of frames generated

					//-------------------------------
					// Parses a JAni frame and returns a Frame object
					//-------------------------------
					let currentFrame	= []; // current frame being generated
					const commitFrame	= () => {
						// If there's no lines in the current frame, skip.
						if ( currentFrame.length===0 ) return; // skip

						// Create new frame [object]
						const frame		= frames.length>0 ? ani.createFrame() : ani.getFrameAt(0);
						// Track if this frame ends up with any valid layers/sprites
						let hasContent	= false;

						// Iterate over each "frame" line(s) & parse
						let lindex		= 0;
						for ( const line of currentFrame ) {
							// Skip empty lines or lines without any sprite data
							if ( !line || !line.trim() ) continue;
							else if ( line.startsWith('PLAYSOUND') ) {
								// HANDLE SOUND EFFECT LINES
								continue; // skip
							}

							// Get line parts.
							const parts	= line.split(',').map( part=>part.trim() );
							// Create new layer (skipping for first auto-created layer).
							const layer	= lindex!==0 ? frame._createLayer() : frame.getLayerAt(0);

							// Handle each element of the line.
							for ( const part of parts ) {
								const [spriteId,x,y] = part.split(/\s+/).map(Number);
								//console.log( spriteId, x, y );
								const sprite = sprites.find( s=>s.id===spriteId );
								if ( sprite ) {
									// Create sprite reference.
									const sticker = sprite.createSticker( x, y );
									// Add sprite reference to layer.
									layer.addSticker( sticker );
									hasContent = true; // found valid sprite
								}
							}

							// Increment layer count.
							lindex ++;
						}

						// Add generated frame to frames container.
						if ( hasContent )
							frames.push( frame );

						currentFrame = []; // clear currentFrame buffer
					}

					//-------------------------------
					// Iterate Each Line
					//-------------------------------
					i++; // skip "ANI"
					while ( i<lines.length && lines[i]!=='ANIEND' ) {
						const line = lines[i].trim();
						// Commit current frame buffer (creates AnimationFrame)
						// or push line into current frame buffer.
						if ( line==='' ) commitFrame();	// clear buffer
						else currentFrame.push( line );	// add to buffer
						i++; // iterate to next line
					}

					// Ensure a list of frames for results exists.
					if ( !result.frames ) result.frames = [];
					// Add generated frame into list of frames.
					result.frames.push( ...frames );

					return i + 1; // skip ANIEND
				}
			);

			//------------------------
			// ENCODER
			//------------------------
			Klass.registerKeywordEncoder(
				subtype,
				function ( ctx, frames ) {
					if ( !frames ) return [];
					const lines = [ 'ANI' ];
					// Call frame serializer.
					for ( const frame of frames )
						lines.push( frame.encode() );
					lines.push( 'ANIEND' );
					return lines;
				}
			);
		}
	};

	// register with JestParserJani class
	if ( typeof window.JestParserJani?.use==='function' )
		window.JestParserJani.use( type, plugin );
	else console.error( 'ani.plugin.js load error: JestParserJani.use() not found' );
})( window );
