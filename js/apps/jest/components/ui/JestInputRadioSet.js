//-------------------------------------------------------
// JEST ® All Rights Reserved
// Antago (God of Gravity), author of Graal2001 & Destiny
// Copyright ® 1999-2026
//-------------------------------------------------------
console.log( 'jestAlert: js/apps/jest/components/ui/JestInputRadioSet.js loaded' );

//-----------------------------
// JestInputRadioSet Class
//-----------------------------
// Group of related radio buttons with a single selected value.
// Extends: JestInput
// Emits: 'change' – when selection changes
class JestInputRadioSet extends JestInput {
	// Object Properties
	name        = null;			// [string] shared group name for all radio inputs
	id          = null;			// [string|null] optional ID base (currently unused)
	options     = [];			// [array] list of { value, label } radio choices
	selected    = null;			// [string|null] current selected value

	//-------------------------
	// Constructor
	//-------------------------
	// Initializes the radio set group with options and default selection.
	// * client        – [object] parent system client
	// * name          – [string] group name (used in all radio inputs)
	// * options       – [array] of {value, label} objects
	// * defaultValue  – [string|null] value to mark as checked initially
	constructor( client, name, options=[], defaultValue=null ) {
		super( client ); // call parent constructor
		this.name		= name;
		this.options	= options;
		this.selected	= defaultValue;
	}

	//-------------------------
	// Build UI
	//-------------------------
	// Creates radio inputs and labels, wiring change events.
	// * name     – [string] internal element name
	// * classes  – [array] additional class names
	build( name='radio-set', classes=[] ) {
		if ( classes === null ) classes = [];
		super.build( name, ['radio-set'].mergeUnique( classes ));

		// loop through each option and build radio+label
		this.options.forEach( opt => {
			const id = `${this.name}_${opt.value}`;

			this.panel.addElements([
				{
					name		: `input_${opt.value}`,
					tag			: 'input',
					attributes	: {
						type	: 'radio',
						id		: id,
						name	: this.name,
						value	: opt.value,
						checked	: ( opt.value === this.selected )
					}
				},
				{
					name		: `label_${opt.value}`,
					tag			: 'label',
					attributes	: { for:id },
					text		: opt.label
				}
			]);

			// wire change listener per radio
			const field = this.panel.refs[ `input_${opt.value}` ];
			field.register( 'change', `change-${opt.value}`, e => this.change( e ) );
		});
	}

	//-------------------------
	// Event: Change
	//-------------------------
	// updates selection value and emits 'change'
	// * e – [DOMEvent]
	change( e ) {
		this.selected = e.target.value;
		this.emit( 'change', null, this.selected );
	}

	//-------------------------
	// Set Selected Value
	//-------------------------
	// sets selected value and updates radio DOM state
	// * val – [string]
	setValue( val ) {
		this.selected = val;

		this.options.forEach( opt => {
			const fld = this.panel.refs[ `input_${opt.value}` ];
			if ( fld ) fld.el.checked = ( opt.value === val );
		});
	}

	//-------------------------
	// Get Selected Value
	//-------------------------
	// RETURNS: [string|null] selected value
	getValue() {
		return this.selected;
	}
}
