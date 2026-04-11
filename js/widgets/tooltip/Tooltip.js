//-------------------------------------------------------
// JEST ® All Rights Reserved
// Antago (God of Gravity), author of Graal2001 & Destiny
// Copyright ® 1999-2026
//-------------------------------------------------------
console.log( 'jestAlert: js/widgets/tooltip/Tooltip.js loaded' );

//-------------------------
// Tooltip Class
//-------------------------
class Tooltip extends OSElement {
	// Declare properties
	//text		= null;			// [element] of percent counter

	// Creates a tooltip [object].
	// RETURNS: [object] A new instance.
	// * options		- [object] Configuration options for the class [object].
	constructor( options={} ) {
		// Call the parent constructor
		super( options );
		// Setup the tooltip before creating the element
		this.setup();			// setup the tooltip
		this.render();			// render the tooltip
	}

	// Setup the tooltip [object].
	// RETURNS: [boolean] `true` on success else `false` on fail.
	setup() {
		super.setup();			// call parent setup method
		// Ensure class(es) include tooltip class(es)
		this.classes.push( 'jest-tooltip' );
		// Override some settings
		this.tag		= 'div';
		return true;			// success
	}
}
