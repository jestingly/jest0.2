console.log( 'jestAlert: js/apps/jest/components/ui/JestCollapsibleMenu.js loaded' );

//-----------------------------
// JestCollapsibleMenu Class
//-----------------------------
// Collapsible stacked sidebar using JestElement.
class JestCollapsibleMenu extends JestElement {
	// Object properties
	sections		= {}; 		// [object] map id → JestElement
	timers			= {};		// [object] map id → failsafe timeout ids
	defaultExclusions = []; // [array<string>] default exclude list for disableAllSections()

	//--------------------------------
	// Constructor
	//--------------------------------
	// RETURNS: [void]
	// * client		- [object] parent reference
	constructor( client ) {
		super( client ); // call parent constructor
	}

	//--------------------------------
	// Build root sidebar container
	//--------------------------------
	//   name		- [string]
	//   classes	- [array]
	build( name='collapsible-menu', classes=[] ) {
		// Construct the parent panel.
		if ( classes===null ) classes = [];
		super.build( 'div', name, ['collapsible-menu'].mergeUnique( classes ) );
		// Add panel elements.
		this.panel.addElements([
			{ name:'sections', tag:'div', classes:['sidebar-sections'] }
			]);
	}

	//--------------------------------
	// Add a collapsible section
	//--------------------------------
	// Add a new section to the collapsible menu.
	// RETURNS: Generated JestDisplay [object] or [null] on fail.
	// * id			- [string] Value of section unique id.
	// * title		- [string] Value of section dropdown menu title.
	// * item		- [Panel|HTMLElement|string] DOM-related item to add to section display.
	//   opts		- [object] { icon, open, classes:{ section, title, panel } }
	//   contents	- [any] Backend data that will be used for display contents.
	addSection( id, title, item=null, opts={}, contents=null ) {
		// Remove old if exists
		if ( this.sections[id] )
			this.removeSection( id );

		// Create a proper JestSection
		const section	= new JestSection( this.client, id, title, opts.icon );
		section.build( opts ); // build section using supplied options

		// Append item if given
		if ( item )
			section.addItem( id, item );

		// Store contents if provided.
		section.setContents( contents ); // set backend data

		// Setup toggle click behavior
		const panel		= section.panel;
		panel.refs.title.register(
			'click', 'toggleSection',
			() => {
				// Toggle open or close.
				const open = panel.hasClass( 'is-open' );
				this.toggle( section, !open );
				// Save current state for restoration
				section._wasOpen = !open;
			}, 'dom' );

		// Track previous open state (used for enableSection())
		section._wasOpen	= opts.open ?? false;

		// Store & mount
		this.sections[id]	= section; // keep ref
		this.panel.refs.sections.addPanel( id, section.panel );
		return section; // return new JestSection [object]
	}

	//--------------------------------
	// Get Display Section
	//--------------------------------
	// Open or close a section.
	// RETURNS: [bool] success.
	// * section	– [object] section to toggle off or on.
	//   open		- [bool] whether to open or collapse.
	toggle( section, open=false ) {
		//-------------------------
		// Get Items & Reset
		//-------------------------
		// Get panels & elements.
		const panel		= section.panel;
		const content	= panel.refs.content;
		const id		= this.getSectionId( section );
		// Block toggle if section is disabled
		if ( panel.el.classList.contains('is-disabled') ) return false; // halt
		// Clear previous state.
		this.resetSection( id );
		//-------------------------
		// Add Opening Animation
		//-------------------------
		// Handle expanding / collapsing state.
		if ( open ) {
			// Signal class as expanding.
			panel.addClass( 'is-opening' ); // let container know state
			// Force reflow.
			void content.el.offsetHeight;
			// Add fallback height for empty sections
			if ( content.el.scrollHeight===0 )
				content.el.style.minHeight = '1px';
			content.el.style.maxHeight	= `${content.el.scrollHeight}px`;
			// Register animation end event (on content).
			content.register(
				'transitionend', 'animating',
				(e) => {
					// Toggle classes for container.
					panel.removeClass( 'is-opening' );
					panel.addClass( 'is-open' );
					// Force reflow of visible height & remove event.
					content.el.style.overflow	= ''; // force reflow
					content.unregister( 'transitionend', 'animating' );
				}, 'dom' );
			// Register failsafe fallback
			this.timers[id] = setTimeout(
				() => {
					if ( panel.hasClass('is-opening') ) {
						console.warn('[Failsafe] Forced is-open: ' + id);
						panel.removeClass('is-opening');
						panel.addClass('is-open');
					}
					this.timers[id] = null;
				}, 500 ); // match transition time + buffer
			return true; // success
		}
		//-------------------------
		// Add Collapsing Animation
		//-------------------------
		else {
			// Signal class as collapsing
			panel.addClass( 'is-closing' ); // let container know state
			// Force reflow.
			void content.el.offsetHeight;
			content.el.style.maxHeight	= '0px'; // readjust section content height
			// Register animation end event (on content).
			content.register(
				'transitionend', 'animating',
				( e ) => {
					// Toggle classes for container.
					panel.removeClass( 'is-closing' );
					panel.addClass( 'is-closed' );
					// Force reflow of visible height & remove event.
					content.el.style.overflow	= ''; // force reflow
					content.unregister( 'transitionend', 'animating' );
				}, 'dom' );
			// Register failsafe fallback
			this.timers[id] = setTimeout(
				() => {
					if ( panel.hasClass('is-closing') ) {
						console.warn('[Failsafe] Forced is-closed: ' + id);
						panel.removeClass('is-closing');
						panel.addClass('is-closed');
					}
					this.timers[id] = null;
				}, 500 );
			return true; // success
		}
	}

	//--------------------------------
	// Get Display Section
	//--------------------------------
	// RETURNS: [JestDisplay|null]
	// * id		– [string] section id to retrieve
	getSection( id ) {
		const section = this.sections[id];
		return (section instanceof JestDisplay) ? section : null;
	}

	//--------------------------------
	// Remove a section by id
	//--------------------------------
	// Remove a section previously added.
	removeSection( id ) {
		const section = this.sections[id];
		if ( !section ) return false;
		section.panel.el.remove();
		delete this.sections[id];
		return true;
	}

	//--------------------------------
	// Reset a Section
	//--------------------------------
	// Reset a section display.
	// RETURNS: [bool] true if disabled
	// * id		– [string] Section ID to disable
	resetSection( id ) {
		//-------------------------
		// Validate & Get Items
		//-------------------------
		// Access requested section.
		const section = this.getSection( id );
		if ( !section ) return false;
		// Get panels & elements.
		const panel		= section.panel;
		const content	= panel.refs.content;
		//-------------------------
		// Reset Timer(s)
		//-------------------------
		// Cancel existing timeout.
		if ( this.timers[id] ) {
			clearTimeout( this.timers[id] );
			this.timers[id] = null;
		}
		//-------------------------
		// Reset Class(es) & Event(s)
		//-------------------------
		// Clear previous state.
		const classes	= [ 'is-opening', 'is-closing', 'is-open', 'is-closed', 'is-disabled' ];
		panel.removeClass( classes );
		content.unregister( 'transitionend', 'animating' );
		return true; // success
	}

	//--------------------------------
	// Open a Section By Name
	//--------------------------------
	// Open a section using its id [string] name value.
	// RETURNS: [bool] whether opened or not.
	// * id		– [string] Section ID to open
	openSection( id ) {
		// Access requested section.
		const section = this.getSection( id );
		if ( !section ) return false;
		// Attempt to toggle section.
		return this.toggle( section, true );
	}

	//--------------------------------
	// Open a Section By Name
	//--------------------------------
	// Close a section using its id [string] name value.
	// RETURNS: [bool] whether closed or not.
	// * id		– [string] Section ID to close
	closeSection( id ) {
		// Access requested section.
		const section = this.getSection( id );
		if ( !section ) return false;
		// Attempt to toggle section.
		return this.toggle( section, false );
	}

	//--------------------------------
	// Disable a section (force close & block interaction)
	//--------------------------------
	// Disable a section from being opened.
	// RETURNS: [bool] true if disabled
	// * id		– [string] Section ID to disable
	disableSection( id ) {
		const section = this.getSection( id );
		if ( !section ) return false;
		// Force collapse and apply disabled flag
		this.toggle( section, false ); // force close
		// Clear previous state.
		this.resetSection( id );
		section.panel.addClass( 'is-disabled' );
		// Optionally: add tooltip or visual cue
		//section.panel.refs.title.setAttribute( 'title', 'This section is disabled' );
		return true;
	}

	//--------------------------------
	// Enable a section (re-allow toggling)
	//--------------------------------
	// Enable a previously disabled section.
	// RETURNS: [bool] true if enabled
	// * id		– [string] Section ID to enable
	enableSection( id ) {
		// Access requested section.
		const section = this.getSection( id );
		if ( !section ) return false;
		// Clear previous state.
		this.resetSection( id );
		// Remove disabled class and clear tooltip
		section.panel.removeClass( 'is-disabled' );
		// Re-open if it was open before being disabled
		if ( section._wasOpen )
			this.toggle( section, true );
		//section.panel.refs.title.removeAttribute( 'title' );
		return true;
	}

	//--------------------------------
	// Add a section ID to the disable exclusion list
	//--------------------------------
	// Add one or more IDs to the default exclusion list.
	// Ignores invalid or duplicate entries.
	// RETURNS: [void]
	// * ids – [string|string[]] Section ID(s) to preserve during disableAll
	addDisableExclusion( ids ) {
		// Normalize input
		if ( typeof ids==='string' ) ids = [ ids ];
		if ( !(ids instanceof Array) ) return;
		// Add each valid ID
		ids.forEach(
			id => {
				if ( typeof id==='string' && id.length>0 && !this.defaultExclusions.includes(id) )
					this.defaultExclusions.push( id );
			});
	}

	//--------------------------------
	// Remove section ID(s) from the disable exclusion list
	//--------------------------------
	// Remove one or more IDs from the default exclusion list.
	// RETURNS: [void]
	// * ids – [string|string[]] Section ID(s) to remove from defaultExclusions
	removeDisableExclusion( ids ) {
		// Normalize input
		if ( typeof ids==='string' ) ids = [ ids ];
		if ( !(ids instanceof Array) ) return;
		// Remove each valid ID
		ids.forEach(
			id => {
				if ( typeof id==='string' && id.length>0 ) {
					const i = this.defaultExclusions.indexOf( id );
					if ( i!==-1 ) this.defaultExclusions.splice( i, 1 );
				}
			});
	}

	//--------------------------------
	// Clear all disable exclusions
	//--------------------------------
	// RETURNS: [void]
	clearDisableExclusions() {
		this.defaultExclusions = [];
	}

	//--------------------------------
	// Disable all sections (with optional exclusion override)
	//--------------------------------
	// Disable all collapsible sections, respecting default exclusions or not.
	// RETURNS: [bool] true on success, false on error.
	// * exclude - [string|string[]|null] Section id(s) to exclude (optional).
	// * useDefaultExclusions - [bool] Whether to merge default exclusions (default: true)
	disableAllSections( exclude=null, useDefaultExclusions=true ) {
		//--------------------------------
		// Normalize and merge exclusions
		//--------------------------------
		let excludeList = [];

		// Convert string → array
		if ( typeof exclude==='string' ) excludeList = [ exclude ];
		else if ( exclude instanceof Array ) excludeList = [ ...exclude ];
		else if ( exclude===null ) excludeList = []; // force disable all
		else {
			console.error( 'disableAllSections() failed: invalid exclude input:', exclude );
			return false;
		}

		// Merge with defaults if applicable
		if ( useDefaultExclusions )
			excludeList = [ ...new Set( [...this.defaultExclusions, ...excludeList] ) ];

		//--------------------------------
		// Disable everything not excluded
		//--------------------------------
		this.getSectionIds().forEach(
			id => {
				if ( !excludeList.includes(id) )
					this.disableSection(id);
			});

		return true;
	}

	//--------------------------------
	// Force disable all sections (ignores default exclusions)
	//--------------------------------
	// Disables all sections, forcibly overriding exclusions.
	// RETURNS: [bool]
	forceDisableAllSections() {
		// Direct full disable with no exclusions.
		return this.disableAllSections( null, false ); // no exclusions, no merge
	}

	//--------------------------------
	// Enable all sections
	//--------------------------------
	// Iterate all sections & enable.
	// RETURNS: [bool] true on success, false on error.
	// * exclude - [string|string[]] Section id(s) to exclude (optional).
	enableAllSections( exclude=[] ) {
		// Normalize input
		if ( typeof exclude==='string' ) exclude = [ exclude ];
		if ( !(exclude instanceof Array) ) {
			console.error( 'enableAllSections() failed: invalid exclude input:', exclude );
			return false;
		}
		// Iterate & enable all not in exclude list
		this.getSectionIds().forEach(
			id => {
				if ( !exclude.includes(id) )
					this.enableSection(id);
			});
		return true; // success
	}

	//--------------------------------
	// Collapse all sections
	//--------------------------------
	// Collapse all collapsible sections.
	collapseAll() {
		Object.values( this.sections ).forEach(
			section => {
				// Collapse section.
				this.toggle( section, false );
			});
	}

	//--------------------------------
	// Expand all sections
	//--------------------------------
	// Expand all collapsible sections.
	expandAll() {
		Object.values( this.sections ).forEach(
			section => {
				// Expand section.
				this.toggle( section, true );
			});
	}

	//--------------------------------
	// Get list of section ids
	//--------------------------------
	// Get a list of all section ids.
	getSectionIds() {
		return Object.keys( this.sections );
	}

	//--------------------------------
	// Get section ID
	//--------------------------------
	// Iterate all sections & get section id.
	// * section	– [object] section to toggle off or on.
	getSectionId( section ) {
		// Iterate & enable.
		const ids	= this.getSectionIds(); // get [array] of ids
		for ( const id of ids )
			if ( this.sections[id]===section )
				return id; // found
		return null; // not found
	}

	//--------------------------------
	// Re-compute height for one section
	//--------------------------------
	// Refresh a given section to fit contents.
	refit( id ) {
		// Check if section exists.
		const section	= this.sections[id];
		if ( !section ) return;
		// Access content & look for its new height.
		const content 	= section.panel.refs.content;
		const contentEl	= content.el;
		if ( section.panel.hasClass('is-open') ) {
			// Force reflow
			void content.el.offsetHeight;
			contentEl.style.maxHeight = `${contentEl.scrollHeight}px`;
		}
	}

	//--------------------------------
	// Refresh all open sections
	//--------------------------------
	// Refresh all sections to fit their contents.
	refreshAll() {
		// Iterate all sections & resize menu to fit.
		Object.keys(this.sections).forEach( id=>this.refit(id) );
	}
}
