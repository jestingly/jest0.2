console.log( 'jestAlert: js/apps/jest/components/ui/JestTooltip.js loaded' );

//-----------------------------
// JestTooltip Class
//-----------------------------
// Floating tooltip element that follows mouse cursor.
// Binds to any target element and displays styled caption.
// Extends: JestElement
class JestTooltip extends JestElement {
	// Tooltip element properties
	box				= null;		// [object] DOM box for tooltip content
	active			= false;	// [bool] true if visible
	text			= '';		// [string] current caption content

	//--------------------------------
	// Constructor
	//--------------------------------
	// Create tooltip system and floating panel.
	// * client		- [object] app or parent instance
	constructor( client ) {
		super( client );	// call parent constructor
		this.build();		// auto-build
	}

	//--------------------------------
	// Build Tooltip DOM
	//--------------------------------
	// Creates the floating tooltip DOM box.
	// RETURNS: [void].
	// * name		- unique [string] value of component name in the system.
	// * classes	- [array] of classes to add to panel element.
	build( name='tooltip', classes=[] ) {
		// Construct the parent panel.
		if ( classes===null ) classes = [];
		super.build( 'div', name, ['jest-tooltip'].mergeUnique(classes) );
		// --------------------------------
		// Create Status Bar Display(s)
		// --------------------------------
		// Add internal box to display text
		this.panel.addElements([{
			name     : 'box',
			tag      : 'div',
			classes  : ['tooltip-box']
			}]);
		this.box = this.panel.refs.box; // keep ref
		// Append DOM element to the document.
		document.body.appendChild( this.panel.el );
		this.hide(); // hidden by default
	}

	//--------------------------------
	// Bind Tooltip to Element
	//--------------------------------
	// Hooks hover and movement on a target element.
	// RETURNS: [void]
	// * el		- [object] DOM element
	// * text	- [string] caption text
	bind( el, text ) {
		// Require element.
		if ( !el ) return;
		// Show & move on-enter.
		el.addEventListener(
			'mouseenter',
			( e ) => {
				// Set text & show tooltip.
				this.text = text;	// set text
				this.show( e );		// show tooltip
			});
		// Add event listeners.
		el.addEventListener( 'mousemove',  (e)=>this.move(e) );
		el.addEventListener( 'mouseleave', ()=>this.hide() );
	}

	//--------------------------------
	// Show Tooltip
	//--------------------------------
	// Displays and positions the tooltip.
	// RETURNS: [void]
	// * e	- [object] MouseEvent
	show( e ) {
		// Require box element.
		if ( !this.box ) return;
		// Set inner text of element.
		this.box.setHTML( this.text ?? '' );
		this.panel.removeClass( 'hidden' ); // show
		this.active = true; // set active
		this.move( e ); // position immediately
		this.emit( 'show', { text:this.text } );
	}

	//--------------------------------
	// Hide Tooltip
	//--------------------------------
	// Hides the floating element.
	// RETURNS: [void]
	hide() {
		// Toggle off & deactivate.
		this.panel.addClass( 'hidden' ); // hide
		this.active = false;		// deactivate
		this.emit( 'hide', null );	// emit hide event
	}

	//--------------------------------
	// Move Tooltip with Mouse
	//--------------------------------
	// Follows cursor position.
	// RETURNS: [void]
	// * e	- [object] MouseEvent
	move( e ) {
		// Require tooltip to be active.
		if ( !this.active || !this.box ) return;

		const pad = 12;								// [int] Default padding from cursor
		const tip  = this.panel.el;				// [object] Tooltip outer element
		const rect = tip.getBoundingClientRect();	// [DOMRect] Current size

		// Get dimensions of container (window or scrollable div if needed)
		const bounds = document.body.getBoundingClientRect();

		let x = e.pageX + pad;
		let y = e.pageY + pad;

		const maxX = window.innerWidth  + window.scrollX;
		const maxY = window.innerHeight + window.scrollY;

		// Clamp X: prevent right overflow
		if ( x + rect.width > maxX ) x = maxX - rect.width - pad;
		if ( x < 0 ) x = 0;

		// Clamp Y: prevent bottom overflow
		if ( y + rect.height > maxY ) y = maxY - rect.height - pad;
		if ( y < 0 ) y = 0;

		// Apply clamped position
		tip.style.left = `${x}px`;
		tip.style.top  = `${y}px`;
	}


	//--------------------------------
	// Auto-Bind Data Attributes
	//--------------------------------
	// Finds all `[data-tooltip]` elements and binds tooltips.
	// RETURNS: [void]
	autoBind() {
		// Find all DOM elements with tooltip & bind.
		const all = document.querySelectorAll( '[data-tooltip],[data-tooltip-html],[data-tooltip-keys]' );
		all.forEach( el => this._bindAutoTooltip(el) );
	}

	//--------------------------------
	// Enable Live Mode
	//--------------------------------
	// Automatically binds any new element with data-tooltip on hover.
	// RETURNS: [void]
	enableLiveMode() {
		document.body.addEventListener(
			'mouseover',
			e => {
				const el = e.target.closest( '[data-tooltip],[data-tooltip-html],[data-tooltip-keys]' );
				if ( !el || el.__jestTooltipBound ) return;
				// Mark as bound to avoid duplicates
				el.__jestTooltipBound = true;
				// Attach dynamic binding
				this._bindAutoTooltip( el );
			});
	}

	//--------------------------------
	// Detects and Binds Tooltip Data
	//--------------------------------
	// Finds tooltip and appends shortcut (if present).
	// * el - [object] DOM element
	_bindAutoTooltip( el ) {
		// Get base tooltip: HTML > plain
		let base = el.getAttribute('data-tooltip-html')
			?? el.getAttribute('data-tooltip')
			?? '';
		// Get keyboard shortcut (if any)
		const keyStr = el.getAttribute('data-tooltip-keys');
		if ( keyStr ) {
			const formatted = this._formatShortcut( keyStr );
			base += ` <span class="tooltip-shortcut">${formatted}</span>`;
		}
		// Trim base text & bind it to element's tooltip.
		if ( base.trim() )
			this.bind( el, base );
	}

	//--------------------------------
	// Format Keyboard Shortcut
	//--------------------------------
	// Converts "ctrl+s" → "<kbd>Ctrl</kbd> + <kbd>S</kbd>"
	// RETURNS: [string] HTML
	// * shortcut - [string] like "cmd+shift+d"
	_formatShortcut( shortcut='' ) {
		const map = {
			cmd     : '⌘',
			ctrl    : 'Ctrl',
			control : 'Ctrl',
			shift   : '⇧',
			alt     : 'Alt',
			option  : '⌥',
			enter   : '↵',
			esc     : 'Esc',
			delete  : '⌫',
			del     : '⌫',
			up      : '↑',
			down    : '↓',
			left    : '←',
			right   : '→'
			};
		return shortcut
			.split( '+' )
			.map( k => `<kbd>${map[k.toLowerCase()] || k.toUpperCase()}</kbd>` )
			.join( ' + ' );
	}
}
