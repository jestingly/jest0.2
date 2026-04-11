//-------------------------------------------------------
// JEST ® All Rights Reserved
// Antago (God of Gravity), author of Graal2001 & Destiny
// Copyright ® 1999-2026
//-------------------------------------------------------
console.log( 'jestAlert: js/apps/jest/components/ui/JestTabbar.js loaded' );

//-------------------------
// JestTabbar Class
//-------------------------
// A file menu for handling events such as save, open, etc.
class JestTabbar extends JestMenu {
	// Object properties
	views			= [];			// [array] of open JestFileView [objects].
	// Dynamic properties
	activeView		= null;			// [object] JestFileView currently open.
	activeButton	= null;			// [object] JestButton currently active.

	// --------------------------------
	// Constructor
	// --------------------------------
	// Construct the [object].
	// RETURNS: [void].
	// * client		- client [object] that this piece belongs to.
	constructor( client ) {
		super( client ); // call parent constructor
	}

	// --------------------------------
	// Initialization
	// --------------------------------
	// Build the element [object].
	// RETURNS: [void].
	// * name		- unique [string] value of component name in the system.
	// * classes	- [array] of classes to add to panel element.
	build( name='tabbar', classes=[] ) {
		// Construct the parent panel.
		if ( classes===null ) classes = [];
		super.build( name, ['tabbar'].mergeUnique(classes) );
	}

	//-------------------------
	// Add/Remove View(s)
	//-------------------------
	// Add a JestFileView to the menu handler.
	// RETURNS: JestButton [object] or null if fail.
	// * view		- [JestFileView] instance representing an open tab.
	addView( view ) {
		//-----------------------------
		// Validate Argument(s)
		//-----------------------------
		// Validate view class instance type.
		if ( !(view instanceof JestFileView) ) {
			console.warn( `Tabbar Add View: argument must be of type JestFileView.` );
			return null;
		}

		//-----------------------------
		// Store View Reference
		//-----------------------------
		// Avoid duplicates
		if ( this.views.includes(view) ) return null;
		this.views.push( view ); // push view into [array]

		//-----------------------------
		// Create Tabbar Button
		//-----------------------------
		// Create a tabbar button for the view.
		const action	= { name: view.skey, text: view.file.stem };
		const button	= this.createButton( action );
		button.clicker.addClass( 'x-button' );

		//-----------------------------
		// Configure to View
		//-----------------------------
		button.skey		= view.skey; // match button skey to view
		// Create event to update tabbar button filename when changed.
		view.file.register( 'stemChange', 'tabbar', file=>this.renameButton(button,file) );
		// Make new view the active tab.
		this.setActiveView( view );

		//-----------------------------
		// Add (X) Close Button Inside Tab Button
		//-----------------------------
		button.clicker.addElements([
			{
				name       : 'closeBtn',
				tag        : 'div',
				classes    : [ 'button-close' ],
				elements: [
					{
					name       : 'x',
					tag        : 'svg',
					classes    : [ 'ico-x' ],
					attributes : {
						xmlns        : "http://www.w3.org/2000/svg",
						viewBox      : "0 0 24 24",
						width        : "24",
						height       : "24",
						"aria-hidden": "true"
						},
					elements   :
						[
							{
								name       : 'path',
								tag        : 'path',
								attributes :
									{
									d                : 'M6 6 L18 18 M6 18 L18 6',
									stroke           : 'currentColor',
									'stroke-width'   : '2',
									'stroke-linecap' : 'round'
									}
							}
						]
					}]
			}]);
		// Register "close" (x)-button click event.
		button.clicker.refs.closeBtn.register(
			'click', 'closeTab', e=>this.btnClose(e,action,button), 'dom' );
		return button; // success
	}

	// Remove a previously added view from the menu.
	// * view		- [JestFileView] instance representing an open tab.
	removeView( view ) {
		// Check if view is in views [array]
		const index	= this.views.indexOf( view );
		if ( index===-1 ) {
			console.warn( `Tabbar Remove View: argument must be of type JestFileView.` );
			return false;
		}
		// Detach event listener(s)
		view.file.unregister( 'stemChange', 'tabbar' );
		// Remove the button.
		this.removeButton( this.getButton(view.skey) );
		// Remove view from views [array].
		this.views.splice( index, 1 );
		// if the removed view was active, pick its nearest neighbour
		if ( this.activeView===view ) {
			// No tabs remaining in the tabbar
			if ( this.views.length===0 )
				this.setActiveView( null );
			// There's a tab at the same position (to the right).
			else if ( index<this.views.length )
				this.setActiveView( this.views[index] );
			// Fall back to the last tab on the left
			else this.setActiveView( this.views[index-1] );
		}
		return true; // success
	}

	//-------------------------
	// Rename Tab
	//-------------------------
	// Rename the tab to match the new filename.
	// RETURNS: [void]
	// * button		- [object] JestButton serving as a clickable button.
	// * file		- [string] Value of new filename.
	renameButton( button, file ) {
		// Change button visual name.
		button.rename( file.stem );
	}

	//-------------------------
	// Set Active View
	//-------------------------
	// Switch the active view and update the button states.
	// RETURNS: [void]
	// * view	- [object] View object being set as active.
	setActiveView( newView=null ) {
		//console.log( 'Changing active view...' );
		//-------------------------
		// Clear Previous Active Button
		//-------------------------
		// Log current view if active.
		let prevView	= null;
		// Check for active view.
		if ( this.activeView!==null ) {
			Object.entries(this.buttons).forEach(
				([key,button]) => {
					if ( button.skey===this.activeView.skey )
						button.panel.refs.clicker.removeClass( 'active' );
				});
			// Keep reference to current view.
			prevView	= this.activeView;
		}
		//-------------------------
		// Emit Tab Change Event
		//-------------------------
		// Emit tab change even.
		this.emit( 'pretabChange', null, prevView, newView );
		//-------------------------
		// Set New Active View
		//-------------------------
		// Set "view" as the new active view.
		this.activeView = newView; // new view (showing)
		//-------------------------
		// Highlight Active Button
		//-------------------------
		// If view [object] supplied, make all buttons active.
		if ( newView!==null ) {
			Object.entries(this.buttons).forEach(
				([key,button]) => {
					if ( button.skey===newView.skey )
						button.panel.refs.clicker.addClass( 'active' );
				});
		}
		//-------------------------
		// Emit Tab Change Event
		//-------------------------
		// Emit tab change even.
		this.emit( 'tabChange', null, newView, prevView );
	}

	//-------------------------
	// Set Active View
	//-------------------------
	// Close a view and update the button states.
	// RETURNS: [void]
	// * view	- [object] View object being set as active.
	closeTab( view=null ) {
		//-------------------------
		// Emit Tab Close Event
		//-------------------------
		// Emit a close event passing a view to listener(s).
		this.emit( 'tabClose', null, view );
	}

	// --------------------------------
	// Event Handling
	// --------------------------------
	// Callback when a button was clicked.
	// RETURNS: [void].
	// * e			- [object] MouseEvent event listener data.
	// * action		- [string] Value of action of button.
	// * button		- [object] JestButton serving as a clickable button.
	btnClick( e, action, button ) {
		// Emit an event
		//this.emit( 'btnClick', null, e, action, button );
		// Call parent method.
		super.btnClick( e, action, button );
		// Change the tab view.
		this.views.forEach(
			view => {
				// Skip view if it is not the button's view.
				if ( view.skey!==button.skey ) return;
				// Set the targeted view as active.
				this.setActiveView( view );
			});
	}

	// Callback when an (x) close-button is clicked inside tab.
	// RETURNS: [void].
	// * e			- [object] MouseEvent event listener data.
	// * action		- [string] Value of action of button.
	// * button		- [object] JestButton serving as a clickable button.
	btnClose( e, action, button ) {
		// Close the tab view.
		this.views.forEach(
			view => {
				// Skip view if it is not the button's view.
				if ( view.skey!==button.skey ) return;
				// Attempt to close the targeted view.
				this.closeTab( view );
			});
		// Prevent bubbling action from triggering tab click.
		e.stopPropagation();
	}
}
