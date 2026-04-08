console.log( 'jestAlert: js/apps/jest/components/ui/JestInputSelectOption.js loaded' );

//-----------------------------
// JestInputSelectOption Class
//-----------------------------
// Single option element for select dropdown.
class JestInputSelectOption extends JestElement {
	// Parent ownership
	_owner		= null;		// [object] reference to owning JestInputSelect (or null)
	// Object properties
	_index		= -1;		// [int] Value of input select option's position in dropdown.
	value		= '';		// [string] internal value attribute
	label		= '';		// [string] visual display text

	//--------------------------------
	// Constructor
	//--------------------------------
	// Constuct the [object] instance.
	// * client		- [object] parent reference
	// * value		- [string] option value
	// * label		- [string] visible label
	//   index		- [int] value of frame's index in the animation.
	constructor( client, value, label, index=-1 ) {
		super( client );			// call parent constructor
		this.value	= value;		// set unique value/id
		this.label	= label;		// set select box option readable label
		this.setIndex( index );		// default layer index
	}

	//--------------------------------
	// Set the Owning Select
	//--------------------------------
	// Called automatically by JestInputSelect during _moveOptionTo().
	setOwner( select ) {
		//--------------------------------
		// Validate Input
		//--------------------------------
		// Validate the select is an input dropdown.
		if ( !(select instanceof JestInputSelect) && select!==null ) {
			console.warn( 'setOwner(): Invalid select passed in.' );
			return false; // abort
		}

		//--------------------------------
		// Set the Owner
		//--------------------------------
		// Set the owner.
		this._owner = select;
	}
	// Called automatically by JestInputSelect during _moveOptionTo().
	getOwner() { return this._owner; }
	// Check if this option is inside a select box
	// RETURNS: [bool]
	hasOwner() { return !!this._owner; }

	//--------------------------------
	// Remove Self From Owner
	//--------------------------------
	// Detaches this option from its parent JestInputSelect if it exists.
	// RETURNS: [bool] true if removed successfully
	detachFromOwner() {
		// Check if owner is set.
		if ( !this._owner ) return false;
		// Remoev the option if it exists.
		const success = this._owner.removeOption( this.value );
		this.setOwner( null ); // nullify the owner
		return success; // return [boo]
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
		this._index	= index;
	}

	//--------------------------------
	// Build Option Element
	//--------------------------------
	// Build the element [object].
	// RETURNS: [void].
	// * name		- unique [string] name of component.
	// * classes	- [array] additional CSS classes to apply.
	build( name='option', classes=[] ) {
		// Construct the parent panel.
		if ( classes === null ) classes = [];
		super.build( name, [`option-${this.value}`].mergeUnique( classes ));
		this.panel.el.value		= this.value;
		this.panel.el.innerText	= this.label;
	}

	//--------------------------------
	// Update the label text of the option
	//--------------------------------
	// RETURNS: [void]
	// * label – [string] new label text
	setLabel( label ) {
		this.label = label;
		if ( this.panel?.el ) this.panel.el.innerText = label;
	}
}
