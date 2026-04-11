//-------------------------------------------------------
// JEST ® All Rights Reserved
// Antago (God of Gravity), author of Graal2001 & Destiny
// Copyright ® 1999-2026
//-------------------------------------------------------
console.log( 'jestAlert: js/mediacore/animation/AnimationObject.js loaded' );

//-------------------------
// AnimationObject Class
//-------------------------
// Animation objects extend the anchor class; they are considered movable screen objects.
class AnimationObject extends Anchor {
	// Object propert(ies).
	groups		= {};		// [object] Groups controlling sprites.

	//-------------------------
	// Instantiation
	//-------------------------
	// Construct the [object].
	// RETURNS: [void].
	constructor() {
		super();	// call parent constructor
	}

	//-------------------------
	// Setting Group(s)
	//-------------------------
	// Sets a single animation group with validation
	// RETURNS: [void].
	// * key	- [string] Group name
	// * value	- [any] Group value
	setGroup( key, value ) {
		// Validate argument(s)
		if ( typeof key!=="string" )
			throw new TypeError( `setGroup() expects a string key, got ${typeof key}` );
		// Assign group
		this.groups[key] = value;
	}

	// Unsets a single animation group with validation
	// RETURNS: [void].
	// * key	- [string] Group name
	unsetGroup( key ) {
		// Validate argument(s)
		if ( typeof key!=="string" )
			throw new TypeError( `unsetGroup() expects a string key, got ${typeof key}` );
		// Remove group if it's set.
		if ( !this.hasGroup(key) ) return;
		delete this.groups[key];
	}

	// Retrieves a group or returns a default value
	// RETURNS: [any] Value of the group or defaultValue if not found
	// * key	- [String] The group name
	// * defaultValue - [...] Default value if the group doesn't exist (optional)
	getGroup( key, defaultValue=null ) {
		// Validate argument(s)
		if ( typeof key!=="string" )
			throw new TypeError( `getGroup() expects a string key, got ${typeof key}` );
		// Return group
		return this.groups.hasOwnProperty(key) ? this.groups[key] : defaultValue;
	}

	//-------------------------
	// RENAME GROUP KEY
	//-------------------------
	// Renames an internal group key stored on this View's group map.
	// RETURNS: [boolean] true if renamed
	// * oldName	- [string] previous group key
	// * newName	- [string] new group key
	renameGroup( oldName, newName ) {
		//-------------------------
		// Validate Argument(s)
		//-------------------------
		if ( typeof oldName!=='string' || typeof newName!=='string' )
			return false; // abort
		if ( oldName===newName )
			return false; // abort

		//-------------------------
		// Check Group Existence
		//-------------------------
		// Preserve group value.
		const value = this.getGroup?.( oldName );
		if ( value===undefined )
			return false; // not found

		//-------------------------
		// Apply Rename
		//-------------------------
		this.unsetGroup?.( oldName );		// remove old key
		this.setGroup?.( newName, value );	// assign to new key

		return true; // success
	}

	// Check if animation has an group
	// RETURNS: [void]
	// * key	- [string] Group name
	hasGroup( key ) { return key in this.groups; }
}
