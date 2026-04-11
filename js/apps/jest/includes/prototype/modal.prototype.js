//-------------------------------------------------------
// JEST ® All Rights Reserved
// Antago (God of Gravity), author of Graal2001 & Destiny
// Copyright ® 1999-2026
//-------------------------------------------------------
console.log( 'jestAlert: js/apps/jest/includes/prototype/modal.prototype.js loaded' );

//--------------------------------
// Create or Retrieve Modal by Name
//--------------------------------
// Dynamically creates a reusable modal dialog with:
// - optional title + message
// - optional input fields
// - customizable button actions
//
// RETURNS: [JestModal]
// * name    - [string] unique modal name
// * config  - [object] modal config object:
//   {
//     title   : [string] header text
//     text    : [string] body text
//     inputs  : [array] input configs: { name, id?, default?, placeholder?, label? }
//     buttons : [object] button configs: { confirm: { label, onClick, close? }, ... }
//   }
Jest.prototype.addModal = function( name, config={} ) {
	//--------------------------------
	// Check if Modal Exists
	//--------------------------------
	// Check if modal already exists (same name).
	if ( this.modals[name] )
		return this.modals[name]; // reuse existing

	//--------------------------------
	// Build Modal
	//--------------------------------
	// Create a modal [object].
	const modal	= new JestModal( this );
	modal.build( `modal-${name}` ); // build it
	modal.close(); // default to hidden

	//--------------------------------
	// Set Modal Title/Text
	//--------------------------------
	// Check for title & message text.
	if ( config.title ) modal.setTitle( config.title );
	if ( config.text )  modal.setText( config.text );

	//--------------------------------
	// Add Input Fields (Extended Types)
	//--------------------------------
	// Accepts "type" property to render advanced inputs.
	if ( Array.isArray(config.inputs) ) {
		// Iterate configurated inputs.
		for ( const input of config.inputs ) {
			// Extract data for input field.
			const type			= input.type ?? 'text';
			const name			= input.name;
			const id			= input.id ?? null;
			const def			= input.default ?? null;
			const placeholder	= input.placeholder ?? null;
			const label			= input.label ?? null;
			const options		= input.options ?? null;
			// Create field based upon type.
			switch ( type ) {
				case 'text':
					modal.addTextfield( name, id, def, placeholder, label );
					break;
				case 'textarea':
					modal.addTextarea( name, id, def, placeholder, label );
					break;
				case 'checkbox':
					modal.addCheckbox( name, id, def, label );
					break;
				case 'radio':
					modal.addRadioSet( name, id, def, options, label );
					break;
				//--------------------------------
				// Case: Select (Dropdown)
				//--------------------------------
				// Supports either static options or dynamic LiveOptionCache binding.
				case 'select': {
					// Check if input.cacheBind is a LiveOptionCache instance
					if ( input.cacheBind instanceof JestLiveOptionCache ) {
						// Create select dropdown with empty options (populate later)
						const select = modal.addSelect( name, id, def, [], label );
						// Bind the dropdown to live data
						input.cacheBind.bind( select, input.filter ?? null );
					}
					// Fallback to static options
					else modal.addSelect( name, id, def, options, label );
					break; }
				case 'range':
					modal.addRange( name, id, def, label );
					break;
				case 'number':
					modal.addNumber( name, id, def, placeholder, label );
					break;
				case 'file':
					modal.addFileSelect( name, id, def, label );
					break;
				default:
					console.warn(`Unknown input type '${type}' for modal field '${name}'`);
					break;
			}
		}
	}

	//--------------------------------
	// Add Buttons
	//--------------------------------
	// Create input button(s).
	if ( config.buttons ) {
		for ( const [key,def] of Object.entries(config.buttons) ) {
			// Add a button to the modal.
			modal.addButton(
				key, def.label,
				()=>{
					if ( def.onClick ) {
						const data = modal.getAllInputs();
						def.onClick( data, modal );
					}
					// Check for auto-close on button click.
					if ( def.close!==false )
						modal.close();
				});
		}
	}

	//--------------------------------
	// Store and Return
	//--------------------------------
	// Add modal to the document body DOM.
	document.body.appendChild( modal.panel.el );
	// Keep modal in the modals stack.
	if ( !this.modals ) this.modals = {};
	this.modals[name] = modal;
	return modal; // return modal
}
