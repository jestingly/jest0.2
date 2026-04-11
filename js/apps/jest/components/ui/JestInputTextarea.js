//-------------------------------------------------------
// JEST ® All Rights Reserved
// Antago (God of Gravity), author of Graal2001 & Destiny
// Copyright ® 1999-2026
//-------------------------------------------------------
console.log( 'jestAlert: js/apps/jest/components/ui/JestInputTextarea.js loaded' );

//-----------------------------
// JestInputTextarea Class
//-----------------------------
// Multi-line textarea input for long-form content.
// Extends: JestInput
// Emits: 'input', 'change'
class JestInputTextarea extends JestInput {
	// Object Properties
	name         = null;		// [string|null] input name
	id           = null;		// [string] HTML id
	defaultValue = null;		// [string|null] default content
	placeholder  = null;		// [string|null] placeholder hint
	rows         = 4;			// [int] row count for textarea height

	//-------------------------
	// Constructor
	//-------------------------
	// Initializes a textarea field with configurable rows and placeholder.
	// RETURNS: [void].
	// * client			- [object] parent client application.
	constructor(
		client, name=null, id=null, defaultValue="",
		placeholder=null, rows=4, readOnly=false ) {
		super( client ); // call parent constructor
		// Determine default value, placholder field hint & label.
		this.setName( name ?? null );				// [string] value of field name
		this.setId( id ?? this.skey );				// [string] HTML id
		this.setDefault( defaultValue ?? null );	// [string] default input value
		this.setPlaceholder( placeholder ?? null );	// [string] field hint (if no default input)
		this.setReadonly( readOnly ?? false );		// [bool] set field read-only
	}

	//-------------------------
	// Build UI
	//-------------------------
	// Build the element [object].
	// creates <textarea> element and registers event handlers
	// RETURNS: [void].
	// * name		- unique [string] name of component.
	// * classes	- [array] additional CSS classes to apply.
	build( name='textarea', classes=[] ) {
		if ( classes === null ) classes = [];
		super.build( name, ['textarea'].mergeUnique( classes ));
		// Build initial panel element.
		this.panel.addElements([{
			name		: 'input',
			tag			: 'textarea',
			text		: this.defaultValue,
			attributes	:
				Object.assign({
					id		: this.id,
					name	: this.name,
					rows	: this.rows
					},
					this.placeholder !== null ? { placeholder:this.placeholder } : {}
					)
			}]);

		// cache textarea reference
		this.field = this.panel.refs.input;

		// wire live input + finalized change
		this.registerDOMEvent( 'input' );
		this.registerDOMEvent( 'change' );
	}

	//-------------------------
	// Event: Input
	//-------------------------
	// emits input with current text
	input( e ) {
		this.emit( 'input', null, e.target.value );
	}

	//-------------------------
	// Event: Change
	//-------------------------
	// emits change with current text
	change( e ) {
		this.emit( 'change', null, e.target.value );
	}

	//-------------------------
	// Get Current Value
	//-------------------------
	// RETURNS: [string]
	getValue() {
		return this.field ? this.field.el.value : this.defaultValue;
	}

	//-------------------------
	// Set Value
	//-------------------------
	// * val – [string] new content
	setValue( val ) {
		if ( this.field ) this.field.el.value = val;
	}
}
