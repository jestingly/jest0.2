//-------------------------------------------------------
// JEST ® All Rights Reserved
// Antago (God of Gravity), author of Graal2001 & Destiny
// Copyright ® 1999-2026
//-------------------------------------------------------
console.log( 'jestAlert: js/apps/jest/components/ui/JestCuratorObject.js loaded' );

//-----------------------------
// JestCuratorObject Class
//-----------------------------
// Object wrapper for registered selectable data.
class JestCuratorObject extends JestElement {
	// Object properties
	id		= '';			// [string] unique identifier
	data	= {};			// [object] attached data
	action	= '';			// [string] optional data action

	//--------------------------------
	// Constructor
	//--------------------------------
	// RETURNS: [void]
	// * client	- [object] parent context
	// * id		- [string] object ID
	// * data	- [object] optional payload
	constructor( client, id='', data={} ) {
		super( client ); // call parent constructor
		this.id		= id;
		this.data	= data;
		this.action	= data.action ?? '';
	}

	//--------------------------------
	// Build Component (Optional View)
	//--------------------------------
	// Create a visible panel with info.
	// RETURNS: [void]
	// * name		- [string] DOM name ID
	// * classes	- [array] optional class list
	build( name='predefined-object', classes=[] ) {
		// Construct the parent panel.
		if ( classes===null ) classes = [];
		super.build( 'div', name, ['predefined-object'].mergeUnique(classes) );
		/*this.panel.addElements([
			{ name: 'id',		tag: 'div', classes: ['object-id'], text: this.id },
			{ name: 'action',	tag: 'div', classes: ['object-action'], text: this.action },
			{ name: 'data',		tag: 'pre', classes: ['object-data'], text: JSON.stringify(this.data, null, 2) }
		]);*/
	}

	//--------------------------------
	// Set Object ID
	//--------------------------------
	// RETURNS: [bool] success
	// * str	- [string] new ID
	setId( str ) {
		if ( typeof str!=='string' || str.trim()==='' ) return false;
		this.id = str;
		this.emit( 'update-id', null, str );
		if ( this.panel?.refs?.id ) this.panel.refs.id.el.innerText = str;
		return true;
	}

	//--------------------------------
	// Set Data Object
	//--------------------------------
	// RETURNS: [bool] success
	// * obj	- [object] new data
	setData( obj ) {
		// Ensure data is [object] & update property.
		if ( typeof obj!=='object' || Array.isArray(obj) || obj===null )
			return false; // abort
		this.data = obj;
		// Emit event.
		this.emit( 'update-data', null, obj );
		// Optional: update action if embedded
		if ( obj.action ) this.setAction( obj.action );
		// Update inner text.
		if ( this.panel?.refs?.data )
			this.panel.refs.data.el.innerText = JSON.stringify( obj, null, 2 );
		return true; // success
	}

	//--------------------------------
	// Update a Single Data Property
	//--------------------------------
	// Safely updates one key in the data object.
	// RETURNS: [bool] success
	// * key	- [string] key to update
	// * value	- [any] new value
	updateData( key, value ) {
		// Validate argument(s).
		if ( typeof key!=='string' || key==='' )
			return false; // abort
		// Ensure data is [object] & update property.
		if ( typeof this.data!=='object' || this.data===null ) this.data = {};
		this.data[key] = value;
		// Emit event.
		this.emit( 'update-data-key', null, key, value );
		// Check if action is being set.
		if ( key==='action' ) this.setAction( value ); // keep action in sync
		// Update inner text.
		if ( this.panel?.refs?.data )
			this.panel.refs.data.el.innerText = JSON.stringify( this.data, null, 2 );
		return true; // success
	}

	//--------------------------------
	// Set Object Action
	//--------------------------------
	// RETURNS: [bool] success
	// * str	- [string] action value
	setAction( str ) {
		if ( typeof str!=='string' ) return false;
		this.action = str;
		this.emit( 'update-action', null, str );
		if ( this.panel?.refs?.action ) this.panel.refs.action.el.innerText = str;
		return true;
	}

	//--------------------------------
	// Get Summary Line
	//--------------------------------
	// RETURNS: [string] readable string
	summary() {
		return `${this.id} (${this.action || 'unknown'})`;
	}

	//--------------------------------
	// Export Object
	//--------------------------------
	// RETURNS: [object] structure
	toObject() {
		return {
			id:		this.id,
			action:	this.action,
			data:	this.data
		};
	}
}
