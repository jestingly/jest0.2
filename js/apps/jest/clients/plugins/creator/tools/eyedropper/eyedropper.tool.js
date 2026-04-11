//-------------------------------------------------------
// JEST ® All Rights Reserved
// Antago (God of Gravity), author of Graal2001 & Destiny
// Copyright ® 1999-2026
//-------------------------------------------------------
console.log( 'jestAlert: js/apps/jest/clients/plugins/creator/tools/eyedropper/eyedropper.tool.js loaded' );

//-------------------------
// JestToolEyedropper Class
//-------------------------
// Tool for selecting a tile from the level by clicking on the canvas.
// Emits 'sample' event containing tile data at selected location.
class JestToolEyedropper extends JestTool {
	// Object Properties
	target			= null;			// [object] ElementCanvas for click event.

	// --------------------------------
	// Constructor
	// --------------------------------
	// Construct the [object].
	// RETURNS: [void].
	// * client		- [object] Application client that this piece belongs to.
	// * name		- [string] Value of tool name.
	constructor( client, name ) {
		super( client, name ); // call parent constructor
		const changed	= []; // track sparse undo
	}

	//-------------------------
	// Initialization
	//-------------------------
	// Build the element [object].
	// RETURNS: [void].
	// * name		- unique [string] value of component name in the system.
	// * classes	- [array] of classes to add to panel element.
	build( name='tool-eyedropper', classes=[] ) {
		// Construct the parent panel.
		if ( classes===null ) classes = [];
		const defaultClasses	= [ 'tool-eyedropper' ];
		super.build( name, defaultClasses.mergeUnique(classes) );
		// Tool is idle by default.
		this.jot( 'mode', 'idle' );	// tool is idle to start
	}

	// --------------------------------
	// Set Target Canvas
	// --------------------------------
	// Set the canvas [object] to enable eyedropper for.
	// RETURNS: [void]
	// * target		- [ElementCanvas] The target to allow selectability on.
	setTarget( target ) {
		// Mode / enableability requirement
		const enabled	= this.skim( 'enabled' );
		const mode		= this.skim( 'mode' );
		if ( enabled || mode!=='idle' ) {
			console.warn( `Eyedropper cannot change target while enabled or active.` );
		}
		// Validate argument(s)
		if ( !(target instanceof ElementCanvas) ) {
			console.warn( `Argument "canvas" must be of type ElementCanvas.` );
			return false; // failed
		}
		// Continue to set the canvas.
		this.target	= target; // set clickable canvas
	}

	// --------------------------------
	// Enable & Disable
	// --------------------------------
	// Enable the eyedropper tool.
	// RETURNS: [boolean] `true` on success else `false` on fail.
	enable() {
		// Check parent constructor.
		if ( !super.enable() ) return false;
		// Add event listener(s)
		this.reset(); // reset the tool
		this.jot( 'enabled', true ); // enable eyedropper
	}

	// Disable the eyedropper tool.
	// RETURNS: [boolean] `true` on success else `false` on fail.
	disable() {
		// Check parent constructor.
		if ( !super.disable() ) return false;
		// Reset the tool.
		this.reset(); // reset eyedropper tool
		// Remove event listener(s)
		this.removeTargetListeners(); // remove target events
		this.removeGlobalListeners(); // remove window events
		// Mark as disabled.
		this.jot( 'enabled', false ); // disable eyedropper
	}

	//-------------------------
	// Resetting Methods
	//-------------------------
	// Reset the eyedropper tool.
	// RETURNS: [void].
	reset() {
		//-------------------------
		// Reset Tool
		//-------------------------
		// Update the tool's mode
		this.jot( 'mode', 'idle' );
		//-------------------------
		// Remove Event Listener(s)
		//-------------------------
		// Tear down all listener(s).
		this.removeTargetListeners(); // remove target events
		this.removeGlobalListeners(); // remove window events
		//-------------------------
		// Add Event Listener(s)
		//-------------------------
		// Create the mouse click event for eyedropper start.
		this.target.register( 'click', 'eyedropperStart', e=>this.start(e), 'dom' );
		//-------------------------
		// Emit Reset Event
		//-------------------------
		// Trigger reset event.
		this.emit( 'reset', null, this );
	}

	//-------------------------
	// Internal: Remove Global Listeners
	//-------------------------
	// Remove target event listener(s).
	removeTargetListeners() {
		this.target.unregister( 'click', 'eyedropperStart' );
	}
	// Remove window event listener(s).
	removeGlobalListeners() {
		//this.target.unregister( jsos.mouseUps, 'eyedropper' );
	}

	//-------------------------
	// Start Eyedropper
	//-------------------------
	// Begin the eyedropper process.
	// RETURNS: [void].
	// * e		- Event [object] from mouse click.
	start( e ) {
		// Mode / enableability requirement
		const enabled	= this.skim( 'enabled' );
		const mode		= this.skim( 'mode' );
		if ( !enabled || mode!=='idle' ) return;
		// Reset the eyedropper tool for new selection.
		this.jot( 'mode', 'sampling' );	// change mode
		// Emit start event.
		this.emit( 'sample', null, e );	// emit event
		this.reset(); // reset the tool
	}
}
