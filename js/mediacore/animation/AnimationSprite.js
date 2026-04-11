//-------------------------------------------------------
// JEST ® All Rights Reserved
// Antago (God of Gravity), author of Graal2001 & Destiny
// Copyright ® 1999-2026
//-------------------------------------------------------
console.log( 'jestAlert: js/mediacore/animation/AnimationSprite.js loaded' );

//-------------------------
// AnimationSprite Class
//-------------------------
// A categorized & named "clip" region inside a spritesheet, belonging to an animation.
class AnimationSprite extends Anchor {
	// Declare properties
	id			= 0;				// [string] value of sprite id (e.g. 0)
	group		= null;				// [string] value of sprite category (e.g. 'ATTR1')
	label		= null;				// [string] value of sprite label (e.g. 'shadow')
	// Image reference propert(ies)
	sx			= 0;				// [int] value of source X position on the spritesheet
	sy			= 0;				// [int] value of source Y position on the spritesheet

	//-------------------------
	// Instantiation
	//-------------------------
	// Constructor for animation sprite.
	// RETURNS: [void].
	// * id			- [int] value of sprite id
	// * group		- [string] value of sprite category
	// * label		- [string] value of sprite label
	//   sx			- [int] value of source X position on the spritesheet
	//   sy			- [int] value of source Y position on the spritesheet
	//   width		- [int] value of custom sprite width
	//   height		- [int] value of custom sprite height
	constructor( id, group, label, sx=0, sy=0, width=16, height=16 ) {
		// Set sprite crop region on image
		super( 0, 0, 0, 0, 0 );		// call parent constructor
		// Set source crop region.
		this.crop( sx, sy, width, height );
		// Identify names of sprite identifiers
		this.setId( parseInt(id) );	// Unique identifier for the sprite
		this.group	= group;		// Group or category (e.g., 'SPRITES', 'SHIELD')
		this.label	= label;		// Descriptive label (e.g., 'shadow', 'shield up')
	}

	//--------------------------------
	// Identification Method(s)
	//--------------------------------
	// Set object unique id.
	// RETURNS: [bool] `true` if success, else `false` if fail.
	// * val	- [int] value of new id value.
	setId( val ) {
		// Validate argument(s).
		if ( !Number.isInteger(val) ) return false;
		// Set property value.
		this.id	= val;
		// Emit event(s).
		this.emit( 'update-id', null, val );
		return true; // success
	}

	// Get object unique id.
	// RETURNS: [int] unique id.
	getId() { return this.id; }

	//--------------------------------
	// Sticker Method(s)
	//--------------------------------
	// Make an animation sprite reference derived from this.
	// RETURNS: [AnimationSticker] or [null].
	//   x	- [int] value of X position in the animation
	//   y	- [int] value of Y position in the animation
	createSticker( x=0, y=0 ) {
		// Create an animation sprite reference instance attached to this id.
		const sticker	= new AnimationSticker( this.id );
		// Move sprite reference to (x,y) @ loc.
		sticker.move( x, y, 0 ); // move to coordinates
		// Resize the reference to match this size.
		sticker.resize( this.width, this.height ); // set anchor dimensions
		return sticker; // return instance
	}

	//-------------------------
	// Cropping Method
	//-------------------------
	// Reassigns the source region on the spritesheet and optionally resizes dimensions.
	// RETURNS: [void]
	// * sx		- [int] source X coordinate on the spritesheet
	// * sy		- [int] source Y coordinate on the spritesheet
	// * width	- [int|null] new width (if null, retains current width)
	// * height	- [int|null] new height (if null, retains current height)
	crop( sx, sy, width=null, height=null ) {
		//-------------------------
		// Validate Input(s)
		//-------------------------
		if ( typeof sx!=="number" || typeof sy!=="number" )
			throw new TypeError( `recrop() requires numeric sx/sy values. Got sx=${typeof sx}, sy=${typeof sy}` );

		//-------------------------
		// Update Source Region
		//-------------------------
		this.sx = sx;		// update source x
		this.sy = sy;		// update source y

		//-------------------------
		// Optionally Resize
		//-------------------------
		if ( width!==null ) {
			if ( typeof width!=="number" )
				throw new TypeError( `recrop() width must be a number or null. Got ${typeof width}` );
			this.width = width;
		}
		if ( height!==null ) {
			if ( typeof height!=="number" )
				throw new TypeError( `recrop() height must be a number or null. Got ${typeof height}` );
			this.height = height;
		}
	}

	//-------------------------
	// Setting Group(s)
	//-------------------------
	// Set sprite group value.
	// RETURNS: [void]
	// * name	- [any] Group name.
	setGroup( name ) {
		//console.error(`changing "${this.label}" to: ${name}`);
		// Validate argument(s)
		if ( typeof name!=="string" )
			throw new TypeError( `setGroup() expects a string name, got ${typeof name}` );
		// Set group.
		this.group = name;
		// Emit group change event.
		this.emit( 'grouped', null, name );
	}

	// Unsets the sprite group value.
	// RETURNS: [void]
	unsetGroup() {
		// Nullify the group image.
		this.group = null;
		// Emit group change event.
		this.emit( 'grouped', null, null );
	}

	// Retrieves the group name of the sprite.
	// RETURNS: [string] Value name of the group.
	getGroup() {
		return this.group;
	}
}
