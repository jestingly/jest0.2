console.log( 'jestAlert: js/mediacore/animation/AnimationObject.js loaded' );

//-------------------------
// AnimationObject Class
//-------------------------
// Animation objects extend the anchor class; they are considered movable screen objects.
class AnimationObject extends Anchor {
	// Groups.
	groups		= {};				// [object] Groups controlling sprites.
	validTypes	= {};				// Define expected group types

	//-------------------------
	// Instantiation
	//-------------------------
	// Construct the [object].
	// RETURNS: [void].
	constructor() {
		super();					// call parent constructor
	}

	//-------------------------
	// Setting Group(s)
	//-------------------------
	// Adds or updates a single valid type
	// RETURNS: [void]
	// * key		- [string] The group name
	// * type		- [string] The expected data type (e.g., "number", "string", "boolean")
	addGroupType( key, type ) {
		// Validate argument(s)
		if ( typeof key!=="string" )
			throw new TypeError( `addGroupType() expects a string key, got ${typeof key}` );
		if ( typeof type!=="string" )
			throw new TypeError( `addGroupType() expects a string type, got ${typeof type}` );
		// Set valid type
		this.validTypes[key] = type;
	}

	// Adds or updates multiple valid types at once
	// RETURNS: [void]
	// * types		- [object] Mapping of group names to expected types
	setGroupTypes( types ) {
		// Validate argument(s)
		if ( typeof types!=="object" || types===null )
			throw new TypeError( `setGroupTypes() expects an object, got ${typeof types}` );
		// Set valid type(s)
		for ( const key in types )
			this.addGroupType( key, types[key] ); // Reuse single method for validation
	}

	// Removes a single valid type
	// RETURNS: [Boolean] True if removed, False if key was not found
	// * key		- [string] The group name
	removeGroupType( key ) {
		// Validate argument(s)
		if ( typeof key!=="string" )
			throw new TypeError( `removeGroupType() expects a string key, got ${typeof key}` );
		// Attempt to remove valid type
		if ( this.validTypes.hasOwnProperty(key) ) {
			delete this.validTypes[key];
			return true;
		}
		return false;
	}

	// Removes multiple valid types at once
	// RETURNS: [Object] Key-value pairs of removed types
	// * ...keys	- [string] List of group names
	removeGroupTypes( ...keys ) {
		// Validate argument(s)
		if ( !keys.every( k => typeof k==="string" ) )
			throw new TypeError( `removeGroupTypes() expects string keys, got ${keys.map(k => typeof k).join(", ")}` );
		// Attempt to remove valid type(s)
		const removed = {};
		keys.forEach(
			key => {
				if ( this.validTypes.hasOwnProperty(key) ) {
					removed[key] = this.validTypes[key];
					delete this.validTypes[key];
				}
			});
		return removed;
	}

	// Check if animation has an group
	// RETURNS: [void]
	// * key		- [string] Group name
	hasGroup( key ) { return key in this.groups; }

	// Sets a single animation group with validation
	// RETURNS: [void]
	// * key	- [string] Group name
	// * value	- [any] Group value
	setGroup( key, value ) {
		// Validate argument(s)
		if ( typeof key!=="string" )
			throw new TypeError( `setGroup() expects a string key, got ${typeof key}` );
		// Get expected type
		const expectedType	= this.validTypes[key];
		// Check primitive types
		if ( expectedType ) {
			if ( typeof expectedType==="string" ) {
				if ( expectedType==="array" && !Array.isArray(value) )
					throw new TypeError( `Invalid type for "${key}". Expected an array.` );
				if ( expectedType!=="array" && typeof value!==expectedType )
					throw new TypeError( `Invalid type for "${key}". Expected ${expectedType}, got ${typeof value}` );
			}
			// Check object/class instances
			else if ( typeof expectedType==="function" ) {
				if ( !(value instanceof expectedType) )
					throw new TypeError( `Invalid type for "${key}". Expected an instance of ${expectedType.name}` );
			}
		}
		// Assign group
		this.groups[key] = value;
	}

	// Retrieves a group or returns a default value
	// RETURNS: [any] Value of the group or defaultValue if not found
	// * key - [String] The group name
	// * defaultValue - [...] Default value if the group doesn't exist (optional)
	getGroup( key, defaultValue=null ) {
		// Validate argument(s)
		if ( typeof key!=="string" )
			throw new TypeError( `getGroup() expects a string key, got ${typeof key}` );
		// Return group
		return this.groups.hasOwnProperty(key) ? this.groups[key] : defaultValue;
	}

	//-------------------------
	// Set Multiple Groups
	//-------------------------
	// Validates and sets animation groups
	// RETURNS: [void]
	// * groups - [object] Groups to control animation.
	//		<key> [string]	- group name
	//		<value> [any]	- group value
	setGroups( groups ) {
		// Validate argument(s)
		if ( typeof groups!=="object" || groups===null )
			throw new TypeError( `setGroups expects an object, got ${typeof groups}` );
		// Iterate & assign group(s) / throw error if wrong type
		for ( const key in groups )
			this.setGroup( key, groups[key] );
	}

	// Retrieves multiple groups at once
	// RETURNS: [Object] Key-value pairs of requested groups
	// * ...keys	- [string] List of group names
	getGroups( ...keys ) {
		// Validate argument(s)
		if ( !keys.every( k => typeof k==="string" ) )
			throw new TypeError( `getGroups() expects string keys, got ${keys.map(k => typeof k).join(", ")}` );
		// Iterate keys & return group(s)
		return keys.reduce(
			( result, key ) => {
				if ( this.groups.hasOwnProperty(key) )
					result[key] = this.groups[key];
				return result;
			}, {});
	}

	// Unsets (removes) a group
	// RETURNS: [boolean] True if removed, False if key was not found
	// * key	- [string] The group name
	unsetGroup( key ) {
		// Validate argument(s)
		if ( typeof key!=="string" )
			throw new TypeError( `unsetGroup() expects a string key, got ${typeof key}` );
		// Attempt to remove group
		if ( this.groups.hasOwnProperty(key) ) {
			delete this.groups[key];
			return true; // success
		}
		return false; // fail
	}

	// Removes multiple groups
	// RETURNS: [Object] Key-value pairs of removed groups
	// * ...keys	- [string] List of group names
	unsetGroups( ...keys ) {
		// Validate argument(s)
		if ( !keys.every( k => typeof k==="string" ) )
			throw new TypeError( `unsetGroups() expects string keys, got ${keys.map(k => typeof k).join(", ")}` );
		// Attempt to remove group(s)
		const removed	= {};
		keys.forEach(
			key => {
				if ( this.groups.hasOwnProperty(key) ) {
					removed[key]	= this.groups[key];
					delete this.groups[key];
				}
			});
		return removed;
	}
}
