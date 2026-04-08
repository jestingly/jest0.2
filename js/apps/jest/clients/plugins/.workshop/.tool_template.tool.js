console.log( 'jestAlert: js/apps/jest/clients/plugins/creator/tools/scrapbook/scrapbook.tool.js loaded' );

//-------------------------
// JestToolScrapbook Class
//-------------------------
// This class frames an [object] that serves as a base usable tool.
class JestToolScrapbook extends JestTool {
	// Object propert(ies)
	//target		= null;			// [object] ElementCanvas for drawing.
	//tracer		= null;			// [object] Anchor used for active tracing.

	// --------------------------------
	// Constructor
	// --------------------------------
	// Construct the [object].
	// RETURNS: [void].
	// * client		- [object] Application client that this piece belongs to.
	// * name		- [string] Value of tool name.
	constructor( client, name ) {
		super( client, name ); // call parent constructor
	}

	//-------------------------
	// Initialization
	//-------------------------
	// Build the element [object].
	// RETURNS: [void].
	// * name		- unique [string] value of component name in the system.
	// * classes	- [array] of classes to add to panel element.
	build( name='tool-scrapbook', classes=[] ) {
		// Construct the parent panel.
		if ( classes===null ) classes = [];
		const defaultClasses	= [ 'tool-scrapbook' ];
		super.build( name, defaultClasses.mergeUnique(classes) );

		// Tool is empty by default.
		this.jot( 'mode', 'empty' );	// tool is idle to start

		/*// Create tracer anchor [object].
		this.tracer	= new Anchor(); // second anchor
		// Force tracer to match grid of anchor.
		this.anchor.register( 'graticulate', 'retrace', s=>this.tracer.graticulate(s) );
		this.tracer.graticulate( this.anchor.units ); // match*/
	}

	// --------------------------------
	// Set File
	// --------------------------------
	// Set the canvas [object] to make selectable.
	// RETURNS: [void]
	// * target		- [ElementCanvas] The target to allow selectability on.
	/*setTarget( target ) {
		// If no selection is made, return null.
		const enabled	= this.skim( 'enabled' );
		const mode		= this.skim( 'mode' );
		if ( enabled || mode!=='empty' ) {
			console.warn( `Scrapbook cannot change target while enabled or active.` );
		}
		// Validate argument(s)
		if ( !(target instanceof ElementCanvas) ) {
			console.warn( `Argument "canvas" must be of type ElementCanvas.` );
			return false; // failed
		}
		// Continue to set the canvas.
		this.target	= target;
	}*/

	// --------------------------------
	// Enable & Disable
	// --------------------------------
	// Enable the scrapbook tool.
	// RETURNS: [boolean] `true` on success else `false` on fail.
	enable() {
		// Check parent constructor.
		if ( !super.enable() ) return false;
		// Add event listener(s)
		this.reset(); // reset the tool
		this.jot( 'enabled', true ); // enable selectability
	}
	// Disable the scrapbook tool.
	// RETURNS: [boolean] `true` on success else `false` on fail.
	disable() {
		// Check parent constructor.
		if ( !super.disable() ) return false;
		// Reset the selection.
		this.reset(); // deselect if selected
		// Remove event listener(s)
		this.removeTargetListeners();	// remove target events
		this.removeGlobalListeners();	// remove window events
		// Mark as disabled.
		this.jot( 'enabled', false );	// disable selectability
	}

	//-------------------------
	// Resetting Methods
	//-------------------------
	// Reset the scrapbook tool.
	// RETURNS: [void].
	// * drop	- [bool] Whether to drop the selection (true, else false).
	reset( drop=true ) {
		//-------------------------
		// Clear Selection
		//-------------------------
		//this.deselect( drop ); // deselect if selected
		//-------------------------
		// Reset Data
		//-------------------------
		// Update the Scrapbook

		//-------------------------
		// Remove Event Listener(s)
		//-------------------------
		// Tear down all listener(s).
		this.removeTargetListeners();	// remove target events
		this.removeGlobalListeners();	// remove window events
		//-------------------------
		// Add Event Listener(s)
		//-------------------------
		// Create the mouse click event for selection start.
		//this.target.register( 'mousedown', 'selectStart', e=>this.checkClick(e), 'dom' );
		//-------------------------
		// Emit Reset Event
		//-------------------------
		// Trigger reset event.
		this.emit( 'reset', null, this );
	}

	//-------------------------
	// Remove Listeners
	//-------------------------
	// Remove scrapbook listener(s).
	removeTargetListeners() {
		/*// Remove selection listener(s).
		this.target.unregister( 'mousedown', 'selectStart' );
		// Remove mouse move listener(s).
		this.target.unregister( 'mousemove', 'selecting' );
		this.target.unregister( 'mousemove', 'dragging' );*/
	}
	// Remove window listener(s).
	removeGlobalListeners() {
		/*// Remove window event(s) for selecting release.
		this.target.unregister( jsos.mouseUps, 'selected' );
		// Remove window  event(s) for dragging release.
		this.target.unregister( jsos.mouseUps, 'dragged' );*/
	}
}
