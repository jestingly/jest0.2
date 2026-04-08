console.log( 'jestAlert: js/apps/jest/components/JestInputOutput.js loaded' );

//-------------------------
// Jest I/O Class
//-------------------------
// An input-output class for keyboard listening
class JestInputOutput extends OSEventTarget {
	//-------------------------
	// Properties
	//-------------------------
	shortcuts		= new Map();		// [Map] of combo string → { action, enabled }
	keyHistory		= [];				// [Array] History of the last 5 key presses
	keyHistorySize	= 10;				// [Int] value of how many key states to store
	activeKeys		= new Map();		// [Map] Tracks keys and their press times
	repeatTimers	= {};				// [Object] Timers for repeat actions
	repeatDelay		= 0;				// [Int] Default delay before repeats (ms)
	repeatInterval	= 0;				// [Int] Default repeat interval (ms)

	//-------------------------
	// Constructor
	//-------------------------
	// Initializes the keyboard listener and starts listening for key events.
	// RETURNS: [void].
	constructor() {
		super();				// Call the parent constructor
		this._bindListeners();	// Bind keydown and keyup listeners
		console.log( 'Input/Output initialized.' );
	}

	//-------------------------
	// Public Methods
	//-------------------------
	// Stops listening to keyboard events.
	// RETURNS: [void].
	destroy() {
		this.unregister( 'keydown', 'press' );
		this.unregister( 'keyup', 'release' );
		console.log( 'KeyboardListener destroyed.' );
	}

	//-------------------------
	// Keyboard Listening
	//-------------------------
	// Binds event listeners for keydown and keyup events.
	// RETURNS: [void].
	_bindListeners() {
		// Use OSEventTarget's `register` for event registration
		this.register( 'keydown', 'press', this._onKeyDown.bind(this), 'window' );
		this.register( 'keyup', 'release', this._onKeyUp.bind(this), 'window' );
	}

	// Handles the `keydown` event.
	// RETURNS: [void].
	// * event		- [KeyboardEvent] The keydown event object.
	_onKeyDown( event ) {
		// Allow a hard refresh.
		/*const isHardRefresh = (
			(event.metaKey || event.ctrlKey) &&
			 event.shiftKey &&
			 event.key.toLowerCase() === 'r'
			 );
		// Prevent keys events from manipulating the page
		if ( !this.isTypingInInput() && !isHardRefresh )
			event.preventDefault();*/
		// Handle key event
		const key	= event.key;
		// Prevent duplicate entries in activeKeys
		if ( !this.activeKeys.has(key) ) {
			const now = performance.now();
			this.activeKeys.set( key, now );
			// Add to key history
			this.keyHistory.push( key );
			if ( this.keyHistory.length>this.keyHistorySize ) {
				this.keyHistory.shift(); // Remove the oldest key
			}
			// Emit a custom event for the pressed key
			this.emit( 'keyPress', null, { event, key, timestamp: now } );
		}
		// Check for shortcut command.
		const combo	= this.normalizeCombo( event );
		const entry	= this.shortcuts.get( combo );
		if ( entry && entry.enabled )
			this.emit( 'keyboardShortcut', null, entry.action );
	}

	// Handles the `keyup` event.
	// RETURNS: [void].
	// * event		- [KeyboardEvent] The keyup event object.
	_onKeyUp( event ) {
		// Prevent keys events from manipulating the page
		event.preventDefault();
		const key	= event.key;
		this.activeKeys.delete( key );
		// Emit a custom event for the released key
		this.emit( 'keyRelease', null, { event, key } );
		// Stop repeat actions for this key
		//clearTimeout( this.repeatTimers[key] );
		//delete this.repeatTimers[key];
	}

	//-------------------------
	// Key Commands / Shortcuts
	//-------------------------
	// Converts an array of keys to a normalized [string] command.
	// RETURNS: [string] The command as a string.
	// * keys	- [Array] Array of key names (e.g., ['Control', 'Shift', 'S']).
	/*command( keys ) {
		return keys.sort().join('+');
	}*/

	// Register a shortcut.
	// * combo		– [string] e.g. "Ctrl+S"
	// * action		– [string] Command name
	// * enabled	– [bool] Whether shortcut is active
	registerShortcut( combo, action, enabled=true ) {
		this.shortcuts.set( combo, { action, enabled } );
	}

	//--------------------------------
	// Toggle Shortcut Enabled/Disabled
	//--------------------------------
	// Enable or disable a specific shortcut by combo string.
	// * combo	– [string] e.g., 'Ctrl+S'
	// * lever	– [bool] true to enable, false to disable
	toggleShortcut( combo, lever=true ) {
		const entry = this.shortcuts.get( combo );
		if ( entry )
			entry.enabled = !!lever;
	};

	// Disable all keyboard shortcuts.
	disableShortcuts() {
		// Disable all editing shortcuts
		for ( const [key,val] of client.shortcuts )
			if ( val.action.startsWith('edit') )
				val.enabled = false;
	}

	//--------------------------------
	// Normalize Key Combo
	//--------------------------------
	// Convert raw key event into a normalized combo string.
	// RETURNS: [string] combo string like "Ctrl+S" or "Meta+A".
	// * e – [KeyboardEvent] event object from browser.
	normalizeCombo( e ) {
		const parts = [];
		if ( e.ctrlKey )  parts.push( 'Ctrl' );
		if ( e.metaKey )  parts.push( 'Meta' );
		if ( e.altKey )   parts.push( 'Alt' );
		if ( e.shiftKey ) parts.push( 'Shift' );
		parts.push( e.key.length===1 ? e.key.toUpperCase() : e.key );
		return parts.join( '+' );
	};

	//--------------------------------
	// Check If Typing in Input
	//--------------------------------
	// Determines if an input, textarea, or editable field is active.
	// RETURNS: [boolean] true if user is typing.
	isTypingInInput() {
		// Get active element in document.
		const el	= document.activeElement;
		if ( !el ) return false;
		// Determine if keyboard I/O listening should be blocked.
		const tag	= el.tagName;
		const type	= el.getAttribute('type')?.toLowerCase();
		return ( tag === 'INPUT' &&
			// Exclude types that shouldn't block global shortcuts.
			!['checkbox','radio','range','button','submit','color'].includes(type) )
			|| tag === 'TEXTAREA'
			|| el.isContentEditable === true;
	};

	//-------------------------
	// Ticker Loop Method(s)
	//-------------------------
	// Listens for a repeat action for a key.
	// * elapsedTime	- how much time has passed since the ticker started.
	// * tickDelay		- how much time between each tick (ie. 60ms)
	// * tickCount		- how many tick have occurred
	// RETURNS: [void].
	update( { elapsedTime, tickDelay, tickCount } ) {
		this.activeKeys.forEach(
			( pressStartTime, key ) => {
				this.emit( 'keyRepeat', null, { key } );
			});
		/*const repeat =
			() => {
				if ( this.activeKeys.has(key) ) {
					// Emit a custom event for the repeated key
					this.emit( 'keyRepeated', null, { key } );
					this.repeatTimers[key] = setTimeout( repeat, this.repeatInterval );
				}
			};
		this.repeatTimers[key] = setTimeout( repeat, this.repeatDelay );*/
	}
}
