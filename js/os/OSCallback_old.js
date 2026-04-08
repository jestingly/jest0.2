console.log( 'jestAlert: js/os/OSCallback.js loaded' );

// OSCallback class
class OSCallback extends OSConfigurable {
	// Element properties
	handlers		= {};			// [array] of event callback(s): [{ command, id, callback, type }]

	//-------------------------
	// Initialization
	//-------------------------
	// Initializes a new OSCallbacks instance.
	// * options		- [object] Configuration options.
	//   callbacks		- [array] Array of callback definitions.
	constructor( options={} ) {
		super( options ); // call parent constructor
	}

	// Apply the [object] initial callback(s) if set.
	// RETURNS: [boolean] `true` on success else `false` on fail.
	initCallbacks() {
		// Apply callbacks if exists.
		if ( this._options.callbacks )
			this._initializeCallbacks( this._options.callbacks );
		return true; // success
	}

	//-------------------------
	// Private Methods
	//-------------------------
	// Initializes callbacks from options (if provided).
	// RETURNS: [void] Nothing.
	// * callbacks		- [array] Array of callback definitions.
	_initializeCallbacks( callbacks ) {
		callbacks.forEach(
			( { command, id, callback, type='manual', iterations=null, data={} } ) => {
				this.register( command, id, callback, type, iterations, data );
			}
		);
	}

	//--------------------------------
	// Register Callback(s)
	//--------------------------------
	// Registers a callback under one or more event names.
	// RETURNS: [boolean] `true` on success else `false` on fail.
	// * command		– [string|array] Event name or array of event names.
	// * id			– [string] Unique ID for the callback.
	// * callback		– [function] The callback function.
	// * type		– [string] Type of callback (default: 'manual').
	// * iterations	– [number|null] Max invocations (null = unlimited).
	// * data		– [object] Additional data (used by extended subclasses).
	register( command, id, callback, type='manual', iterations=null, data={} ) {
		// Handle multiple commands.
		if ( Array.isArray(command) ) {
			let allRegistered = true;
			command.forEach(
				cmd => {
					const success = this.register( cmd, id, callback, type, iterations, { ...data } );
					if ( !success ) allRegistered = false;
				});
			return allRegistered;
		}
		// Create the event category if it doesn't exist.
		if ( !this.handlers[command] )
			this.handlers[command] = [];
		// Prevent duplicate ID registration under same command.
		if ( this.handlers[command].some(handler=>handler.id===id) ) {
			console.warn( `Callback with ID "${id}" is already registered for event "${command}".` );
			return false; // failed
		}
		// Bind & store the handler.
		this.handlers[command].push({
			id,
			callback	: callback.bind(this),
			type,
			iterations,
			iteration	: 0,
			data
			});
		return true; // success
	}

	// Emits all callbacks under an event name.
	// RETURNS: [void] Nothing.
	// * command		- [string] Name of the event to emit.
	//   limit    		- [int] Max number of callbacks to execute (null = all, default: all).
	//   args			- [any] Arguments to pass to the callbacks.
	emit( command, limit=null, ...args ) {
		const callbacks = this.handlers?.[command];
		if ( !callbacks || !Array.isArray(callbacks) ) {
			//console.warn( `No handlers found for event: ${command}` );
			return;
		}
		// Iterate through callbacks and use `trigger` to invoke them.
		let count = 0;
		for ( const handler of callbacks ) {
			if ( handler.type!=='manual' ) continue;	// do not emit non-manual callbacks
			if ( limit!==null && count>=limit ) break;	// stop if limit is reached.
			this._trigger( command, handler.id, ...args );
			count++;
		}
	}

	// Triggers a specific callback by ID under an event name.
	// RETURNS: [void] Nothing.
	// * command		- [string] Name of the event.
	//   id				- [string] ID of the callback to trigger.
	//   args			- [any] Arguments to pass to the callback.
	_trigger( command, id, ...args ) {
		// Validate data.
		const callbacks = this.handlers?.[command];
		if ( !callbacks ) {
			console.warn( `No handlers found for event: ${command}` );
			return;
		}
		// Access handler & attempt to trigger a callback.
		const handler = callbacks.find( (handler)=>handler.id===id );
		if ( handler && typeof handler.callback==='function' ) {
			// Call the callback.
			handler.callback( ...args );
			// Track handler iterations.
			if ( handler.iterations!==null ) {
				handler.iteration++;
				// Remove if it exceeds iterations.
				if ( handler.iteration>=handler.iterations )
					this.unregister( command, id );
			}
		}
		else console.warn( `Handler with ID "${id}" not found for event "${command}".` );
	}

	//--------------------------------
	// Unregister Callback(s)
	//--------------------------------
	// Unregisters a callback by one or more event names.
	// RETURNS: [void] Nothing.
	// * command	– [string|array] Event name or array of names.
	// * id		– [string] ID of the callback to unregister.
	unregister( command, id ) {
		// Handle multiple commands.
		if ( Array.isArray(command) ) {
			command.forEach( cmd => this.unregister(cmd,id) );
			return;
		}
		// Remove handler(s) for the command if present.
		if ( this.handlers?.[command] ) {
			this.handlers[command] = this.handlers[command].filter( (handler)=>handler.id!==id );
			// Clean up empty categories.
			if ( this.handlers[command].length===0 )
				delete this.handlers[command];
		}
	}

}
