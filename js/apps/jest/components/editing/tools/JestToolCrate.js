console.log( 'jestAlert: js/apps/jest/components/editing/tools/JestToolCrate.js loaded' );

//-------------------------
// JestToolCrate Class
//-------------------------
// This class makes a draggable & droppable crate for "garages".
class JestToolCrate extends JestTool {
	// Object propert(ies)
	garages			= [];			// [array] Array of garage Panel instances.
	currentGarage	= null;			// [Panel|null] Garage currently hovered over.
	// Miscellaneous variables
	display			= null;			// [JestDisplay] object for displaying content(s).

	//--------------------------------
	// Constructor
	//--------------------------------
	// Construct the Crate with a Panel.
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
	build( name='tool-crate', classes=[] ) {
		// Construct the parent panel.
		if ( classes===null ) classes = [];
		const defaultClasses	= [ 'tool-crate' ];
		super.build( name, defaultClasses.mergeUnique(classes) );
		// Tool is empty by default.
		this.jot( 'mode', 'empty' );	// tool is idle to start
		// --------------------------------
		// Create Canvas In Crate [object]
		// --------------------------------
		// Add a canvas to the crate for tile display.
		const display	= new JestDisplay( this.client );
		display.build();			// build the display panel
		this.display	= display;	// cross-reference
		this.panel.addPanel( 'display', display.panel );
		// Hide by default.
		this.hide();
	}

	//-------------------------
	// Add/Remove Garage(s)
	//-------------------------
	// Add a Panel that acts as a drop target.
	// * garage		- [JestElement] instance representing a garage.
	addGarage( garage ) {
		// Validate argument(s).
		if ( !(garage instanceof HTMLElement) ) {
			console.warn( `Crate Add Garage: argument must be of type JestElement.` );
			return false;
		}
		// Avoid duplicates
		if ( this.garages.includes(garage) ) return false;
		this.garages.push( garage ); // add to [array]
		return true; // success
	}

	// Remove a previously added garage.
	// * garage		- [JestElement] instance to remove.
	removeGarage( garage ) {
		// Check if garage is in garages [array]
		const index	= this.garages.indexOf( garage );
		if ( index===-1 ) {
			console.warn( `Crate Remove Garage: garage not found.` );
			return false;
		}
		// Remove garage from [array].
		this.garages.splice( index, 1 );
		return true; // success
	}

	//-------------------------
	// Enable Dragging
	//-------------------------
	// Turn on drag capability for this crate.
	// RETURNS: [boolean] `true` on success else `false` on fail.
	enable() {
		// Check parent constructor.
		if ( !super.enable() ) return false;
		// Mode requirement.
		const mode		= this.skim( 'mode' );
		if ( mode!=='empty' ) return false;
		// Enable.
		this.jot( 'enabled', true );	// enable
		return true; // success
	}

	//-------------------------
	// Disable Dragging
	//-------------------------
	// Turn off drag capability.
	// RETURNS: [boolean] `true` on success else `false` on fail.
	disable() {
		// Check parent constructor.
		if ( !super.disable() ) return false;
		// Mode / enableability requirement
		//const mode		= this.skim( 'mode' );
		//if ( mode=='' ) return false;
		// Reset the crate & disable.
		this.reset(); // reset the crate
		this.removeTargetListeners();	// remove target events
		this.jot( 'enabled', false );	// disable
		return true; // success
	}

	//-------------------------
	// Resetting Method(s)
	//-------------------------
	// Reset the crate tool.
	// RETURNS: [void].
	clear() {
		//-------------------------
		// Hide The Crate
		//-------------------------
		this.hide(); // hide the crate
		this.panel.move( 0, 0 );		// move to top left
		this.panel.resize( 0, 0 );		// resize to nothing
		return true; // success
	}

	// Reset the crate tool.
	// RETURNS: [void].
	reset() {
		//-------------------------
		// Update Styling
		//-------------------------
		// Finalize drop: leave element where it is
		this.hide(); // hide the crate
		this.panel.el.style.cursor		= 'grab';	// set cursor to default
		this.panel.el.style.zIndex		= '';		// reset z-index
		//this.panel.el.innerHTML		= '';		// empty content
		//-------------------------
		// Reset Mode & Listener(s)
		//-------------------------
		// Tear down all listener(s).
		this.removeTargetListeners();	// remove target events
		this.removeGlobalListeners();	// remove window events
		this.jot( 'mode', 'empty' );	// change mode
		// Add mousedown event (begin lifting).
		this.panel.register( 'mousedown', 'lift', e=>this.lift(e), 'dom' );
	}

	//-------------------------
	// Show/Hide Method(s)
	//-------------------------
	// Show the crate tool.
	// RETURNS: [void].
	show() {
		//-------------------------
		// Show The Crate
		//-------------------------
		this.panel.removeClass( 'hidden' );	// toggle on as shown
		return true; // success
	}

	// Hide the crate tool.
	// RETURNS: [void].
	hide() {
		//-------------------------
		// Hide The Crate
		//-------------------------
		this.panel.addClass( 'hidden' );	// toggle off as hidden
		return true; // success
	}

	//-------------------------
	// Initializing Moving Method(s)
	//-------------------------
	// Lift method triggered by clicking the crate to drag it.
	// * e	- [object] MouseEvent event listener data.
	lift( e ) {
		//console.log( 'lifted crate' );
		// Mode / enableability requirement
		const enabled	= this.skim( 'enabled' );
		const mode		= this.skim( 'mode' );
		if ( !enabled || mode!=='empty' ) return false;
		e.preventDefault();		// prevent default actions underneath
		e.stopPropagation();	// stop bubbling upward
		//-------------------------
		// Compute Location(s)
		//-------------------------
		// Record initial mouse offset within the element.
		const click		= this.panel.mousePos( e );
		const rect		= this.panel.el.getBoundingClientRect();
		// Get global coordinates.
		const globalX	= e.clientX + window.scrollX;
		const globalY	= e.clientY + window.scrollY;
		//-------------------------
		// Change Mode(s)
		//-------------------------
		// Change mode to "dragging".
		this.jot( 'mode', 'dragging' ); // change mode
		this.show(); // show the crate
		// Begin the drag.
		this.beginDrag( globalX, globalY, click.x, click.y );
	}

	// Method triggered manually to lift the crate (not by mouse click event).
	startDragAt( screenX, screenY, offsetX=0, offsetY=0 ) {
		//console.log( 'start crate drag' );
		// Mode / enableability requirement
		const enabled	= this.skim( 'enabled' );
		const mode		= this.skim( 'mode' );
		if ( !enabled || mode!=='empty' ) return false;
		//-------------------------
		// Compute Location(s)
		//-------------------------
		// Get global coordinates.
		const globalX = screenX + window.scrollX;
		const globalY = screenY + window.scrollY;
		//-------------------------
		// Change Mode(s)
		//-------------------------
		// Change mode to "dragging".
		this.jot( 'mode', 'dragging' ); // change mode
		// Begin the drag.
		this.beginDrag( globalX, globalY, offsetX, offsetY );
		return true; // success
	}

	// Begin dragging the crate.
	beginDrag( globalX, globalY, offsetX, offsetY ) {
		//console.log( 'begin crate drag' );
		// Mode / enableability requirement
		const enabled	= this.skim( 'enabled' );
		const mode		= this.skim( 'mode' );
		if ( !enabled || mode!=='dragging' ) return;
		//-------------------------
		// Compute Location
		//-------------------------
		// Update offset(s)
		this.offsetX	= offsetX; // update offset of click x pos
		this.offsetY	= offsetY; // update offset of click y pos
		// Ensure element is absolute positioned.
		const elStyle	= window.getComputedStyle( this.panel.el );
		if ( elStyle.position!=='absolute' )
			this.panel.el.style.position = 'absolute';
		// Move crate to mouse location.
		const left		= globalX - offsetX - parseFloat(elStyle.borderLeftWidth);
		const top		= globalY - offsetY - parseFloat(elStyle.borderTopWidth);
		this.panel.move( top, left );
		//-------------------------
		// Change Style(s)
		//-------------------------
		this.panel.el.style.zIndex = '9999';
		this.panel.el.style.cursor = 'grabbing';
		//-------------------------
		// Event Handler(s)
		//-------------------------
		// Add global listeners for move & drop
		this.panel.register( 'mousemove', 'dragging', e=>this.move(e), 'window' );
		this.panel.register( jsos.mouseUps, 'dragged', e=>this.drop(e), 'window' );
		//-------------------------
		// Emit Event(s)
		//-------------------------
		// Notify start
		this.emit( 'dragStart', null, this );
	}

	//-------------------------
	// Internal: Move (mousemove)
	//-------------------------
	// * e	- [object] MouseEvent event listener data.
	move( e ) {
		//console.log( 'moving crate' );
		// Mode / enableability requirement
		const enabled	= this.skim( 'enabled' );
		const mode		= this.skim( 'mode' );
		if ( !enabled || mode!=='dragging' ) return;
		e.preventDefault();		// prevent default actions underneath
		e.stopPropagation();	// stop bubbling upward
		//-------------------------
		// Check If Inside Garage
		//-------------------------
		// Get all elements under the cursor, topmost first.
		const els = document.elementsFromPoint( e.clientX, e.clientY );
		let hoveredGarage = null;
		// Walk the array in order; pick the first garage we find.
		for ( const el of els ) {
			for ( const garage of this.garages ) {
				if ( el===garage ) {
					hoveredGarage = garage;
					break;
				}
			}
			if ( hoveredGarage ) break;
		}
		// If hoveredGarage changed vs this.currentGarage, fire enter/leave.
		if ( hoveredGarage!==this.currentGarage ) {
			if ( this.currentGarage ) {
				//console.log( 'left garage' );
				// Emit event, clear garage & remove class.
				this.emit( 'garageLeave', null, this.currentGarage );
				this.currentGarage = null;
				this.panel.removeClass( 'active' );
			}
			if ( hoveredGarage ) {
				//console.log( 'entered garage' );
				// Emit event, set garage & add class.
				this.currentGarage = hoveredGarage;
				this.emit( 'garageEnter', null, this.currentGarage );
				this.panel.addClass( 'active' );
			}
		}
		//-------------------------
		// Move Crate
		//-------------------------
		// Calculate page absolute position so crate follows mouse.
		let px, py; // new coordinates
		const units = this.client.config.tileGrid;
		// Snap x & y to grid if inside garage.
		if ( this.currentGarage!==null ) {
			// Snap inside the garage’s bounding box
			const el	= this.currentGarage;
			const gRect	= el.getBoundingClientRect();
			// borderLeft & borderTop (in pixels) for this element
			const borderLeft	= el.clientLeft;
			const borderTop		= el.clientTop;
			// “rawX” = distance from left edge of garage to cursor
			const rawX	= e.clientX - (gRect.left + borderLeft);
			const rawY	= e.clientY - (gRect.top  + borderTop);
			// Round that local coordinate to nearest tile
			const tileX	= Math.round( rawX/units );
			const tileY	= Math.round( rawY/units );
			// Convert back to page coords by adding gRect.left/top
			px	= gRect.left + borderLeft + tileX * units;
			py	= gRect.top  + borderTop  + tileY * units;
		}
		else { // Free-move: follow the cursor (no snapping)
			px	= e.clientX - this.offsetX;
			py	= e.clientY - this.offsetY;
		}
		// Update element position
		this.anchor.move( px, py );	// update anchor coordinates to track motion
		// Offset px & py to compensate, visually, for border.
		const elStyle	= window.getComputedStyle( this.panel.el );
		px -= parseFloat( elStyle.borderLeftWidth );
		py -= parseFloat( elStyle.borderTopWidth );
		this.panel.move( py+window.scrollY, px+window.scrollX ); // crate visual
		//-------------------------
		// Emit Event(s)
		//-------------------------
		// Notify move.
		this.emit( 'dragMove', null, { px, py } );
	}

	//-------------------------
	// Internal: Drop (mouseup)
	//-------------------------
	// Drop the crate & emit an event about location / garage information.
	// * e	- [object] MouseEvent event listener data.
	drop( e ) {
		//console.warn( 'dropping crate' );
		// Validate argument(s).
		if ( !e ) {
			console.warn( '[Crate] Cannot Drop: arg 1 must be [object] of type MouseEvent.' );
			return;
		}
		// Mode / enableability requirement
		const enabled	= this.skim( 'enabled' );
		const mode		= this.skim( 'mode' );
		if ( !enabled || mode!=='dragging' ) return;
		e.preventDefault();		// prevent default actions underneath
		e.stopPropagation();	// stop bubbling upward
		// Calculate local (x,y) within garage if found
		let localPos	= null;
		if ( this.currentGarage!==null ) {
			// Inside drop(e):
			const pageX		= e.pageX;
			const pageY		= e.pageY;
			// Suppose `this.currentGarage` is the <div> or <canvas> you dropped into:
			const rect		= this.currentGarage.getBoundingClientRect();
			const elemDocX	= rect.left + window.scrollX;
			const elemDocY	= rect.top  + window.scrollY;
			localPos	= {
				x:	pageX - elemDocX,
				y:	pageY - elemDocY
				};
		}
		const pos	= { x: this.anchor.x, y: this.anchor.y };
		// Emit drop event with garage and local position (or null if none)
		this.emit( 'dropped', null, this.currentGarage, localPos );
		this.reset(); // reset the crate
	}

	//-------------------------
	// Internal: Remove Listeners
	//-------------------------
	// Remove crate listener(s).
	removeTargetListeners() {
		// Remove crate listener(s).
		this.panel.unregister( 'mousedown', 'lift' ); // remove lift listener
	}
	// Remove window listener(s).
	removeGlobalListeners() {
		// Remove window event(s) for crate dragging.
		this.panel.unregister( 'mousemove', 'dragging' );
		// Remove window event(s) for crate drag end.
		this.panel.unregister( jsos.mouseUps, 'dragged' );
	}

	//-------------------------
	// Additional Ideas
	//-------------------------
	// • You might add a semi-transparent “ghost” clone of the crate during drag
	//   and leave the original in place until drop. That avoids DOM reflows.
	// • To handle layered garages more accurately, maintain an explicit z-index
	//   or priority property on garages, then pick the highest-priority one under cursor.
	// • If you want snapping behavior, compute the closest grid/alignment in drop.
	// • If you need touch support, register 'touchstart', 'touchmove', 'touchend'
	//   alongside mouse events (with proper preventDefault).
}
