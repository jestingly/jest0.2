console.log( 'jestAlert: js/apps/jest/components/parse/JestParserJani.js loaded' );

//-------------------------
// JestParserJani Class
//-------------------------
class JestParserJani extends JestGamepiece {
	// Static class properties
	// Keywords: [object] Set array of acceptable keyword(s).
	static keywords			= new Set();
	static keywordParsers	= {};	// { keywordName : (ctx, lineArray, indexRef, resultObj) => newIndex }
	static keywordEncoders	= {};	// { keywordName : (ctx, dataObjArray) => stringLines[] }

	//-------------------------
	// Instantiation
	//-------------------------
	// Construct the [object].
	// * client		- [object] Application client that this piece belongs to.
	constructor(client ) {
		super( client ); // call parent constructor
	}

	// Setup the parser (use async).
	async setup() {
		// Initialize method plugin(s).
		await JestParserJani.initPlugins( 'keyword', this );
	}

	//-------------------------
	// Static Plugin Method(s)
	//-------------------------
	// Register the jani keywords for decoding janis.
	static registerKeywordParser( keyword, parserFn ) {
		this.keywords.add( keyword );
		this.keywordParsers[keyword] = parserFn;
	}

	// Register the jani keywords for encoding janis.
	static registerKeywordEncoder( keyword, encoderFn ) {
		this.keywordEncoders[keyword] = encoderFn;
	}

	//-------------------------
	// Frame Handling
	//-------------------------
	// Parses a JAni file into an Animation object
	// * filename		- [string] value of Jani filename to identify animation.
	// * fileContent	- [string] value of Jani file content to generate animation.
	parse( { name: filename, data: fileContent } ) {
		//-------------------------
		// Begin Animation [object]
		//-------------------------
		// Create animation [object].
		const animation	= new AnimationAnimation( filename );

		//-------------------------
		// Iterate Lines & Parse
		//-------------------------
		// Instantiate variables
		const lines		= fileContent.split('\n').map( line=>line.trim() );
		// Iterate over each line in the supplied Jani
		const result	= { animation };
		let i = 0;
		while ( i<lines.length ) {
			const line	= lines[i];
			if ( !line ) { i++; continue; /* skip */ }
			//-------------------------
			// PLUGIN Block Parsing
			//-------------------------
			const keyword	= line.split(/\s+/)[0];
			if ( this.constructor.keywords.has(keyword) ) {
				const fn	= this.constructor.keywordParsers[keyword];
				if ( typeof fn==='function' ) {
					i = fn( this, lines, i, result ) ?? (i+1);
					continue; // skip
				}
			}
			i++; // increment counter
		}

		//-------------------------
		// Preload Animation Part(s)
		//-------------------------
		// Preload group name(s) into config.
		// NOTE: This is used as default image(s) that can be skinned/overrode.
		//animation.setGroup( 'groups', Array.from(animation.groups) );
		if ( result.groups )
			result.groups.forEach( group=>animation.setGroup(group,null) );

		// Store the default group value(s) in animation.
		if ( result.defaults )
			Object.entries( result.defaults )
				.forEach( ([key,value])=>animation.setGroup(key,value) );

		// Store the sprites in the animation.
		if ( result.sprites )
			result.sprites.forEach( sprite=>animation.addSprite(sprite) );

		// Store the options in the animation.
		//if ( result.opts )
			//animation.options	= result.opts;

		// Determine if animation is looping.
		if ( result.opts['LOOP']===true )
			animation.loopOn();
		else animation.loopOff();

		//-------------------------
		// Configure Animation & Return
		//-------------------------
		// Safely reset the sprite counter to upmost next id.
		animation._syncSpriteIdCounter();
		return animation; // [AnimationAnimation] object
	}
}

// Make JestParserJani globally accessible for plugins
window.JestParserJani = JestParserJani;
