//-------------------------------------------------------
// JEST ® All Rights Reserved
// Antago (God of Gravity), author of Graal2001 & Destiny
// Copyright ® 1999-2026
//-------------------------------------------------------
console.log( 'jestAlert: js/apps/jest/components/ui/JestInputText.js loaded' );

//-----------------------------
// JestInputText Class
//-----------------------------
// Versatile single-line input element with full event handling.
// Extends: JestElement
class JestInputText extends JestInput {
	// Object properties
	type		= "text";			// [string] Input type of field (text, password, etc.)

	//--------------------------------
	// Constructor
	//--------------------------------
	// Construct the [object].
	// RETURNS: [void].
	// * client			- [object] parent client application.
	// * name			- [string] optional field name
	// * id				- [string] HTML id (auto-generated if not provided)
	// * defaultValue	- [string] Default fallback value
	// * placeholder	- [string] placeholder text
	// * labelText		- [string] label content
	// * readOnly		- [bool]   Whether field is read-only
	constructor(
		client, name=null, id=null, defaultValue=null,
		placeholder=null, labelText=null, readOnly=false ) {
		super( client ); // call parent constructor
		// Determine default value, placholder field hint & label.
		this.setName( name ?? null );				// [string] value of field name
		this.setId( id ?? this.skey );				// [string] HTML id
		this.setDefault( defaultValue ?? null );	// [string] default input value
		this.setPlaceholder( placeholder ?? null );	// [string] field hint (if no default input)
		this.setLabel( labelText ?? null );			// [string] the text for the label
		this.setReadonly( readOnly ?? false );		// [bool] set field read-only
	}

	//--------------------------------
	// Build Component
	//--------------------------------
	// Build the element [object].
	// RETURNS: [void].
	// * name		- unique [string] name of component.
	// * classes	- [array] additional CSS classes to apply.
	build( name='text', classes=[] ) {
		// Construct the parent panel.
		if ( classes===null ) classes = [];
		super.build( name, ['text'].mergeUnique(classes) );

		//--------------------------------
		// Create Input Field
		//--------------------------------
		// Create input element.
		this.panel.addElements([{
			name:		'input',
			tag:		'input',
			attributes:
				{
				id:		this.id,
				name:	this.name,
				type:	this.type,
				value:	this.defaultValue
				}
			}]);
		// Store reference to field
		this.field = this.panel.refs.input; // quick-ref

		//--------------------------------
		// Set Placeholder (if provided)
		//--------------------------------
		// Optional placeholder (field hint)
		if ( this.placeholder )
			this.setPlaceholder( this.placeholder );

		//--------------------------------
		// Register DOM Events
		//--------------------------------
		// Register all standard DOM input events using channels.
		const events = [
			'input', 'focus', 'blur', 'change',
			'keydown', 'keyup', 'keypress',
			'click', 'dblclick', 'mouseenter', 'mouseleave'
			];
		// Iterate each event & register its channel method.
		for ( const eventName of events )
			this.registerDOMEvent( eventName );
	}

	//--------------------------------
	// Set Input Type
	//--------------------------------
	// Change input field type ("text" or "password").
	// RETURNS: [void]
	// * value	- [string] new input type ("text" or "password").
	setType( value ) {
		// Set the input field type.
		this.type	= value==="text" ? "text" : "password";
		if ( this.el )
			this.el.type = this.type;
	}

	//--------------------------------
	// Get Input Type
	//--------------------------------
	// RETURNS: [string]
	getType() {
		// Get the field label value.
		return this.type;
	}

	//--------------------------------
	// Enable Input Field
	//--------------------------------
	// RETURNS: [bool] true if set, else false.
	enable() {
		// Check parent constructor.
		if ( !super.enable() ) return false;
		return true; // successly changed
	}

	//--------------------------------
	// Disable Input Field
	//--------------------------------
	// RETURNS: [bool] true if set, else false.
	disable() {
		// Check parent constructor.
		if ( !super.disable() ) return false;
		return true; // successly changed
	}

	//--------------------------------
	// DOM Event Channels
	//--------------------------------
	// Each receives native DOM event, re-emits through system
	input( e )		{ this.emit( 'input', null, e ); }
	focus( e )		{ this.emit( 'focus', null, e ); }
	blur( e )		{ this.emit( 'blur', null, e ); }
	change( e )		{ this.emit( 'change', null, e ); }
	keydown( e )	{ this.emit( 'keydown', null, e ); }
	keyup( e )		{ this.emit( 'keyup', null, e ); }
	keypress( e )	{ this.emit( 'keypress', null, e ); }
	click( e )		{ this.emit( 'click', null, e ); }
	dblclick( e )	{ this.emit( 'dblclick', null, e ); }
	mouseenter( e )	{ this.emit( 'mouseenter', null, e ); }
	mouseleave( e )	{ this.emit( 'mouseleave', null, e ); }
}
