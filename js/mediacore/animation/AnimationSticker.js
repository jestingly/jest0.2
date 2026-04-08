console.log( 'jestAlert: js/mediacore/animation/AnimationSticker.js loaded' );

//-------------------------
// AnimationSticker Class
//-------------------------
// A categorized & named "clip" region inside a spritesheet,
// belonging to an animation.
class AnimationSticker extends Anchor {
	// Declare properties
	sid			= 0;			// [string] value of [AnimationSprite] id (e.g. 0)
	_layer		= null;			// [AnimationLayer] instance sticker appears in.

	//-------------------------
	// Instantiation
	//-------------------------
	// Constructor for animation sprite reference "sticker".
	// RETURNS: [void].
	// * sid	- [int] value of [AnimationSprite] id
	constructor( sid ) {
		// Construct the anchor parent class.
		super( 0, 0, 0, 0, 0 );	// call parent constructor
		// Identity of [AnimationSprite].
		this.sid = sid;			// [AnimationSprite] id
	}

	//-------------------------
	// Layer Handling Method(s)
	//-------------------------
	// Set the layer object reference (sticker appears in).
	// RETURNS: [void].
	// * layer	- [AnimationLayer] instance sticker appears in.
	setLayer( layer ) {
		//-------------------------
		// Validate argument(S).
		//-------------------------
		// Layer must be object type specific.
		if ( !(layer instanceof AnimationLayer) )
			throw new Error( 'Invalid layer object' );
		// Layer of [AnimationSprite].
		this._layer = layer; // [AnimationLayer] reference
	}

	// Get the layer object reference (sticker appears in).
	// RETURNS: [AnimationLayer] or [null].
	getLayer() {
		// Layer of [AnimationSprite].
		return this._layer ?? null; // [AnimationLayer] reference
	}
}
