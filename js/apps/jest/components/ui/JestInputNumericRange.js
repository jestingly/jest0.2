console.log( 'jestAlert: js/apps/jest/components/ui/JestInputNumericRange.js loaded' );

//-----------------------------
// JestInputNumericRange Class
//-----------------------------
// Single-line number input with optional constraints.
// Extends: JestInput
class JestInputNumericRange extends JestInput {
	// Object properties
	range	= null;		// [JestInputRange] field slider
	number	= null;		// [JestInputNumber] numeric text field (with arrows)

	//-------------------------
	// Constructor
	//-------------------------
	// Initializes number input field with optional constraints.
	// RETURNS: [void].
	// * client			- client [object] that this piece belongs to.
	// * name			- [string|null] input name
	// * id				- [string] HTML id
	// * defaultValue	- [number|null] starting value
	// * labelText		- [string] label content
	// * min			- [number|null] minimum value
	// * max			- [number|null] maximum value
	// * step			- [number|null] increment step
	constructor( client, name=null, id=null, defaultValue=0, labelText=null,
				 min=0, max=100, step=1 ) {
		super( client );	// call parent constructor
		this.setName( name ?? null );				// [string] value of field name
		this.setId( id ?? this.skey );				// [string] HTML id
		this.setDefault( defaultValue ?? null );	// [string] default input value
		this.setLabel( labelText ?? null );			// [string] the text for the label
		this.min	= min;		// minimum value
		this.max	= max;		// maximum value
		this.step	= step;		// step value
	}

	//-------------------------
	// Build UI
	//-------------------------
	// creates input[type=number] and attaches DOM events
	build( name='numeric-range', classes=[] ) {
		if ( classes === null ) classes = [];
		super.build( name, ['numeric-range'].mergeUnique(classes) );

		//-------------------------
		// Generate Range Field
		//-------------------------
		// Build slider input
		this.range = new JestInputRange(
			this.client, this.name, this.id+'_range',
			this.defaultValue, null,
			this.min, this.max, this.step
			);
		this.range.build();
		this.range.hideLabel();

		//-------------------------
		// Generate Numeric Field
		//-------------------------
		// Build number input
		this.number = new JestInputNumber(
			this.client, this.name+'_num', this.id+'_num',
			this.defaultValue, null, null,
			this.min, this.max, this.step
			);
		this.number.build();
		this.number.hideLabel();

		//-------------------------
		// Attach Range Listener(s)
		//-------------------------
		// Listen to slider → number
		this.range.register(
			['input','change'], 'valueChange',
			( val ) => {
				// Set the numeric field value to mirror.
				this.number.setValue( val, false );	// don't emit
				this.emit( 'input', null, val );	// emit event
			});
		this.range.valueLabel?.hide?.();

		//-------------------------
		// Attach Number Listener(s)
		//-------------------------
		// Listen to number → slider
		this.number.register(
			['input','change'], 'valueChange',
			( val ) => {
				// Set the range slider value to mirror.
				this.range.setValue( val, false );	// don't emit
				this.emit( 'input', null, val );	// emit event
			});

		//-------------------------
		// Create Up/Down Arrow Button(s)
		//-------------------------
		// Create increment/decrement buttons
		this.stepDown	= new JestButton( this.client, 'stepDown' );
		this.stepDown.build( 'step-down', ['step-button'], '-' );
		this.stepUp		= new JestButton( this.client, 'stepUp' );
		this.stepUp.build( 'step-up', ['step-button'], '+' );
		const stepSize	= this.step ?? 1;

		// Create step-down input listener.
		this.stepDown.register(
			'click', 'decreaseValue',
			() => {
				const current = parseFloat(this.number.getValue()) || 0;
				this.number.setValue( current-stepSize );
				this.range?.setValue( current-stepSize );
				this.emit( 'input', null, current-stepSize );
			});

		// Create step-up input listener.
		this.stepUp.register(
			'click', 'increaseValue',
			() => {
				const current = parseFloat(this.number.getValue()) || 0;
				this.number.setValue( current+stepSize );
				this.range?.setValue( current+stepSize );
				this.emit( 'input', null, current+stepSize );
			});

		//-------------------------
		// Add Fields to Panel
		//-------------------------
		// Mount both into panel
		this.panel.addPanel( 'range', this.range.panel );
		this.panel.addPanel( 'number', this.number.panel );
		this.panel.addPanel( 'stepDown', this.stepDown.panel );
		this.panel.addPanel( 'stepUp', this.stepUp.panel );
	}

	//-------------------------
	// Get Current Value
	//-------------------------
	// RETURNS: [number]
	getValue() {
		return this.range?.getValue() ?? this.defaultValue;
	}

	//-------------------------
	// Set Current Value
	//-------------------------
	// Sets slider value with clamping and step normalization.
	// * val	– [number] value to set to.
	// * emit	- [boolean] whether to emit an event (defaults to true).
	setValue( val, emit=true ) {
		this.range?.setValue( val, false );
		this.number?.setValue( val, false );
		if ( emit ) this.emit( 'change', null, val );
	}

	//-------------------------
	// Mirror JestInputRange Method(s)
	//-------------------------
	getMin()		{ return this.range?.getMin(); }
	setMin(v)		{ this.range?.setMin(v); this.number?.setMin(v); }
	getMax()		{ return this.range?.getMax(); }
	setMax(v)		{ this.range?.setMax(v); this.number?.setMax(v); }
	// Set min/max range & step increment value.
	setRange( min, max, step ) {
		// Set the range slider range.
		this.range?.setRange( min, max, step );
		// Set the numeric field range.
		this.number?.setRange( min, max, step );
	}
	getStep()		{ return this.range?.getStep(); }
	setStep(v)		{ this.range?.setStep(v); this.number?.setStep(v); }
	enable()		{ this.range?.enable(); this.number?.enable(); }
	disable()		{ this.range?.disable(); this.number?.disable(); }
}
