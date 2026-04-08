console.log( 'jestAlert: js/apps/jest/clients/plugins/creator/methods/keyboard.plugin.js loaded' );

//--------------------------------
// Keyboard Handling Methods Plugin
//--------------------------------
(function( window ) {
	//-------------------------
	// Plugin Definition
	//-------------------------
	const type		= 'methods';
	const subtype	= 'keyboard';

	//-------------------------
	// Plugin Object
	//-------------------------
	const plugin = {
		//--------------------------------
		// Initialization
		//--------------------------------
		// Initialize the plugin and register global key listener.
		// RETURNS: [void]
		init: function( client ) {
			// Define key shortcut map.
			client.io.registerShortcut( 'Ctrl+O', 'openFile' );
			client.io.registerShortcut( 'Meta+O', 'openFile' );
			client.io.registerShortcut( 'Ctrl+N', 'newFile' );
			client.io.registerShortcut( 'Meta+N', 'newFile' );
			client.io.registerShortcut( 'Ctrl+W', 'closeFile' );
			client.io.registerShortcut( 'Meta+W', 'closeFile' );
			client.io.registerShortcut( 'Ctrl+C', 'copy' );
			client.io.registerShortcut( 'Meta+C', 'copy' );
			client.io.registerShortcut( 'Ctrl+X', 'cut' );
			client.io.registerShortcut( 'Meta+X', 'cut' );
			client.io.registerShortcut( 'Ctrl+V', 'paste' );
			client.io.registerShortcut( 'Meta+V', 'paste' );
			client.io.registerShortcut( 'Ctrl+Z', 'undo' );
			client.io.registerShortcut( 'Meta+Z', 'undo' );
			client.io.registerShortcut( 'Ctrl+Y', 'redo' );
			client.io.registerShortcut( 'Meta+Y', 'redo' );
			client.io.registerShortcut( 'Backspace', 'delete' );
			client.io.registerShortcut( 'Ctrl+S', 'save' );
			client.io.registerShortcut( 'Meta+S', 'save' );
			client.io.registerShortcut( 'Ctrl+Shift+S', 'saveAs' );
			client.io.registerShortcut( 'Meta+Shift+S', 'saveAs' );

			// Keyboard shortcut menu action.
			client.io.register( 'keyboardShortcut', 'defaultCommands',
				command => {
					// Block input shortcuts while user is typing
					if ( client.io.isTypingInInput() ) return;
					// Handle shortcut by command type.
					switch ( command ) {
						case 'openFile'  : client.fileMenuAction( 'open' );		break;
						case 'newFile'   : client.fileMenuAction( 'new' );		break;
						case 'closeFile' : client.fileMenuAction( 'close' );	break;
						case 'copy'      : client.fileMenuAction( 'copy' );		break;
						case 'paste'     : client.fileMenuAction( 'paste' );	break;
						case 'undo'      : client.fileMenuAction( 'undo' );		break;
						case 'redo'      : client.fileMenuAction( 'redo' );		break;
						case 'delete'    : client.fileMenuAction( 'delete' );	break;
						case 'cut'       : client.fileMenuAction( 'cut' );		break;
						case 'save'      : client.fileMenuAction( 'save' );		break;
						case 'save_as'   : client.fileMenuAction( 'save_as' );	break;
					}
				});

			// Prevent "range" inputs from
			const autoblur	= [ 'range', 'checkbox' ];
			document.addEventListener(
				'mouseup',
				e => {
					// Check for auto-blur inputs (to prevent app keyboard-hijacking).
					if ( e.target.tagName==='INPUT' && autoblur.includes(e.target.type) )
						e.target.blur(); // immediately give up focus
				});
		},

		//--------------------------------
		// Extend Client Methods
		//--------------------------------
		extend: function( Klass, proto ) {
			/*//--------------------------------
			// Add New Propert(ies)
			//--------------------------------
			proto.keys = {}; // current active key states, e.g. { 'Shift': true, 'A': true }

			//--------------------------------
			// Handle Key Press Event
			//--------------------------------
			// Process normalized keyboard shortcuts.
			// RETURNS: [void]
			// * e – [KeyboardEvent] keydown event
			proto.keyPress = function( e ) {
				// Log any key being pressed & emit event.
				if ( !(e.key in this.keys) )
					this.keys[e.key] = true;			// set key pressed as active
				this.emit( 'keyPress', null, e.key );	// emit key pressed event
				//console.log( Key pressed: ${data.key} (Mapped: ${key}), this.keys );
			};

			// Handle key releases.
			// * e - [object] Data passed from keyboard listener event.
			proto.keyRelease = function( e ) {
				// Remove key log on release.
				if ( this.keys.hasOwnProperty(e.key) )
					delete this.keys[e.key];			// set key pressed as inactive
				this.emit( 'keyRelease', null, e.key );	// emit key release event
				//console.log( Key released: ${data.key} (Mapped: ${key}), this.keys );
			}*/
		}
	};

	//--------------------------------
	// Register Plugin
	//--------------------------------
	if ( window.JestCreator && typeof window.JestCreator.use==='function' )
		window.JestCreator.use( type, plugin );
	else console.error( 'keyboard.plugin.js load error: JestCreator.use() not found' );
})( window );
