//-------------------------------------------------------
// JEST ® All Rights Reserved
// Antago (God of Gravity), author of Graal2001 & Destiny
// Copyright ® 1999-2026
//-------------------------------------------------------
console.log( 'jestAlert: js/mediacore/animation/AnimationLayer.js loaded' );

//-------------------------
// AnimationLayer Class
//-------------------------
// Animation layer that can be toggled on/off for visual state switching.
class AnimationLayer {
	// Identification properties.
	name			= null;		// [string] Value of animation view name.
	_index			= -1;		// [int] Value of layer’s position in layers.
	// Object propert(ies).
	animation		= null;		// [object] Animation the layer belongs to.
	frame			= null;		// [AnimationFrame] reference.
	stickers		= [];		// [array] of sprite reference [objects].

	//-------------------------
	// Instantiation
	//-------------------------
	// Construct the [object].
	// * animation	- [object] Animation instance to add.
	// * name		- [string] Name of the layer.
	// * frame		- [AnimationFrame] instance layer belongs to.
	//   index		- [int] value of frame's index in the animation.
	constructor( animation, name, frame=null, index=0 ) {
		this.animation	= animation;	// store animation reference
		this.name		= name;			// Assign the view name
		this.setFrame( frame );			// Set layer's frame.
		this.setIndex( index );			// default layer index
	}

	//-------------------------
	// Frame Association
	//-------------------------
	// Sets the parent frame reference.
	// RETURNS: [void].
	// * frame – [AnimationFrame|null] parent frame object
	setFrame( frame ) {
		this.frame = frame;
	}

	// Removes the frame reference from the layer.
	// RETURNS: [void]
	unsetFrame() {
		this.frame = null;
	}

	// Gets the parent frame of this layer.
	// RETURNS: [AnimationFrame|null]
	getFrame() {
		return this.frame ?? null;
	}

	//-------------------------
	// Index Management
	//-------------------------
	// Get the layer's index in the layer lineup.
	// RETURNS: [int] index value of layer order in the frame.
	getIndex() {
		return this._index;
	}

	// Sets the index of this layer within the frame.
	setIndex( index ) {
		this._index = index;
	}

	//-------------------------
	// Building Methods
	//-------------------------
	// Creates a sticker on this layer using a sprite ID at (x,y) position.
	// RETURNS: [object|null] The created sticker or null if sprite not found.
	// * sid	- [string] ID of the sprite to use for the sticker.
	// * x		- [number] X-coordinate of the sticker's position.
	// * y		- [number] Y-coordinate of the sticker's position.
	createSticker( sid, x, y ) {
		//--------------------------------
		// Get Sprite from Animation
		//--------------------------------
		const sprite = this.animation?.getSpriteByID?.( sid );
		// Validate Sprite Exists
		if ( !sprite ) {
			console.warn( `createSticker() failed — sprite not found for ID "${sid}"` );
			return null; // no sprite found
		}

		//--------------------------------
		// Create Sticker via Sprite
		//--------------------------------
		// Create the sticker [object].
		const sticker = sprite.createSticker( x, y );
		this.addSticker( sticker ); // add sticker to layer
		// Return Created Sticker Object
		return sticker; // [AnimationSticker] instance
	}

	// Adds a sticker by sprite ID directly to this layer.
	// RETURNS: [AnimationSticker|null] the created sticker (or null if sprite not found).
	// * sid	- [string] Sprite ID to lookup from animation.
	// * x		- [number] X position to place sticker
	// * y		- [number] Y position to place sticker
	addStickerByID( sid, x=0, y=0 ) {
		//--------------------------------
		// Lookup the Sprite Object
		//--------------------------------
		const sprite	= this.animation?.getSpriteByID?.( sid );
		if ( !sprite ) {
			console.warn( `AnimationLayer.addStickerByID(): sprite not found for ID "${sid}"` );
			return null; // failed
		}

		//--------------------------------
		// Create & Add Sticker
		//--------------------------------
		const sticker	= sprite.createSticker( x, y ); // create new sticker instance
		this.addSticker( sticker );		// add to layer
		return sticker;					// return reference
	}

	// Adds a sprite to this layer.
	// RETURNS: [void].
	// * sticker	- [AnimationSticker] to add to layer
	addSticker( sticker ) {
		//--------------------------------
		// Validate Argument(s)
		//--------------------------------
		// Require sticker to have no existing layer.
		if ( sticker.getLayer()!==null )
			throw new Error( 'Sticker layer already set.' );

		//--------------------------------
		// Add Sticker to Layer
		//--------------------------------
		// Set sticker layer & push into layer.
		sticker.setLayer( this );		// set layer
		this.stickers.push( sticker );	// add to layer
		this._resortZ();				// re-enforce Z order
	}

	// Retrieves a sprite by index.
	// RETURNS: [AnimationSticker] @ index or [null] if not found.
	// * index - [int] Index of the sprite reference to retrieve
	getSticker( index ) {
		return this.stickers[index] ?? null; // return
	}

	// Gets the array of stickers, sorted and normalized by Z.
	// RETURNS: [array<AnimationSticker>]
	getStickers() {
		return this.stickers.slice(); // shallow copy
	}

	// Removes [AnimationSticker] by index.
	// RETURNS: [bool] `true` if removed, else `false` if fail.
	// * index - [int] Index of the sprite reference to remove
	removeSticker( index ) {
		// Validate index is within bounds.
		if ( index>=0 && index<this.stickers.length ) {
			this.stickers.splice( index, 1 ); // return
			// Resequence Z-Indexes
			this._resortZ(); // reindex remaining
			return true; // removed
		}
		// Item not found.
		return false; // not removed
	}

	//-------------------------
	// Remove All Stickers
	//-------------------------
	// Clears all [AnimationSticker] objects from this layer.
	// RETURNS: [int] Count of stickers removed.
	removeAllStickers() {
		//--------------------------------
		// Track Count and Clear Array
		//--------------------------------
		const count = this.stickers.length;	// how many were removed
		this.stickers.length = 0;			// fast clear

		//--------------------------------
		// Return Total Removed
		//--------------------------------
		return count; // total number removed
	}

	// Removes all stickers using a specific Sprite ID.
	// RETURNS: [int] Count of removed stickers.
	// * sid	- [string] Sprite ID to match
	removeStickersByID( sid ) {
		//--------------------------------
		// Filter Out Matching Stickers
		//--------------------------------
		const oldCount	= this.stickers.length;	// track original count
		this.stickers	=
			this.stickers // remove all with matching sid
				.filter( sticker => sticker?.sid !== sid );

		//--------------------------------
		// Resequence Z-Indexes
		//--------------------------------
		this._resortZ(); // reindex remaining
		return oldCount - this.stickers.length;	// return count removed
	}

	//-------------------------
	// Remove Stickers w/ Z-Tracking
	//-------------------------
	// Extracts stickers by sprite ID and remembers their Z-indexes.
	// RETURNS: [array<{ sticker, z }>] of removed stickers with original Z positions.
	// * sid - [string] Sprite ID to match for removal
	extractStickersByID( sid ) {
		//-------------------------
		// Extract Matching Stickers and Track Original Z Positions
		//-------------------------
		// Enforce z-sort (safe fallback).
		this._resortZ(); // rebuild Z-order
		// Begin return extract [array].
		const extracted	= [];
		// Loop backwards to preserve stable Z references while removing
		for ( let i=this.stickers.length-1; i>=0; i-- ) {
			const sticker	= this.stickers[i];
			if ( sticker?.sid===sid ) {
				extracted.unshift( sticker );	// store match w/ Z
				this.stickers.splice( i, 1 );	// remove from layer
			}
		}

		//--------------------------------
		// Resequence Z-Indexes
		//--------------------------------
		// Enforce z-sort (fallback for future).
		//this._resortZ();	// rebuild Z-order
		return extracted;	// [array] of removed sticker(s)
	}

	//-------------------------
	// Restore Removed Stickers
	//-------------------------
	// Re-inserts stickers with tracked Z values into correct positions.
	// RETURNS: [int] Count of restored stickers.
	// * extracted - [array<{ sticker, z }>] list of sticker+Z objects to reinsert
	restoreStickers( extracted ) {
		//-------------------------
		// Restore Sticker Refs to Original Z Order After Removal
		//-------------------------
		let restored = 0;
		// Loop through supplied sticker(s) & insert at Z location.
		for ( const { sticker, z } of extracted ) {
			// Clamp target Z index to safe bounds
			const safeZ = Math.max( 0, Math.min( z, this.stickers.length ) );
			this.stickers.splice( safeZ, 0, sticker ); // insert at target Z
			restored++;
		}

		//-------------------------
		// Resequence Z-Indexes
		//-------------------------
		this._resortZ(); // rebuild proper order
		return restored;
	}

	//-------------------------
	// Z-Ordering Utilities
	//-------------------------
	// Internal: Reindexes all stickers so that z = index (0..n-1).
	_resortZ() {
		// Iterate all sprite references & set Z in-order.
		for ( let i=0; i<this.stickers.length; i++ )
			this.stickers[i].setZ( i );
	}

	// Reorders existing sticker to a new Z index.
	// Shifts all others to maintain 0-n uniqueness.
	// RETURNS: [void].
	// * sticker - [AnimationSticker] to move
	// * newZ      - [int] Target Z position
	moveToZ( sticker, newZ ) {
		//-------------------------
		// Validate Argument(s)
		//-------------------------
		// Check if sprite ref is in layer.
		const currentIndex = this.stickers.indexOf( sticker );
		if ( currentIndex===-1 )
			throw new Error( `AnimationLayer.moveToZ(): sticker not found in layer.` );

		// No need to move item back to its own position.
		if ( currentIndex===newZ ) return;

		//-------------------------
		// Clamp Bound(s)
		//-------------------------
		// Clamp to legal index range.
		const maxIndex = this.stickers.length - 1;
		newZ = Math.max( 0, Math.min(newZ,maxIndex) );

		//-------------------------
		// Remove & Re-Insert Item
		//-------------------------
		// Remove from old index.
		this.stickers.splice( currentIndex, 1 );
		// Insert at new index.
		this.stickers.splice( newZ, 0, sticker );

		//-------------------------
		// Recalculate Indices
		//-------------------------
		// Recalculate Z values to be 0–n again.
		this._resortZ();
	}

	// Inserts a sticker at a specific Z index.
	// All higher stickers shift upward.
	// RETURNS: [void].
	// * sticker - [AnimationSticker] to insert
	// * z         - [int] Desired Z value to insert at
	insertAtZ( sticker, z ) {
		// Reject duplicates — if already exists, use moveToZ
		const currentIndex = this.stickers.indexOf( sticker );
		if ( currentIndex !== -1 ) {
			this.moveToZ( sticker, z ); // already exists → just move it
			return; // abort
		}

		// Clamp z to within allowable range
		const max = this.getTopZ() + 1;
		z = Math.min( z, max );
		if ( z<0 )
			throw new RangeError( `AnimationLayer.insertAtZ(): invalid z=${z}` );

		// Insert sticker
		this.stickers.splice( z, 0, sticker );
		this._resortZ(); // enforce z = 0..n-1
	}

	// Sorts all stickers manually using a custom compare function.
	// Reassigns z = 0..n afterwards.
	// RETURNS: [void].
	// * compareFn - [function] compare( a, b ) like Array.sort
	sortWith( compareFn ) {
		this.stickers.sort( compareFn ); // external sort
		this._resortZ(); // enforce proper z-index
	}

	//-------------------------
	// Querying Method(s)
	//-------------------------
	// Returns the highest Z value currently in use.
	// RETURNS: [int] Max z-value, or -1 if empty.
	getTopZ() {
		return this.stickers.length>0 ? this.stickers.length-1 : -1;
	}
}
