//-------------------------------------------------------
// JEST ® All Rights Reserved
// Antago (God of Gravity), author of Graal2001 & Destiny
// Copyright ® 1999-2026
//-------------------------------------------------------
console.log( 'jestAlert: js/system/forms/FormBuilder.js loaded' );

//-------------------------
// PanelFormBuilder Class
//-------------------------
// Provides a modular and extensible way to build forms and nested elements.
class PanelFormButton extends PanelElement {
	// Construct the form button [object]
	constructor( options ) {
		options.tag = 'button';
		super( options );
		console.log( this._options.callbacks );
		alert(this._options.name);
	}

	// Setup the panel form button [object].
	// RETURNS: [boolean] true or false.
	setup() {
		super.setup();
		this.classes.push( 'jest-panel-element-form-button' );
		return true;
	}
}
