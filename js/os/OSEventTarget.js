//-------------------------------------------------------
// JEST ® All Rights Reserved
// Antago (God of Gravity), author of Graal2001 & Destiny
// Copyright ® 1999-2026
//-------------------------------------------------------
console.log( 'jestAlert: js/os/OSEventTarget.js loaded' );

// Jest environment class
class OSEventTarget extends OSObject {
	// Creates the class [object] with configurable components.
	// RETURNS: [object] A new instance.
	// * options		- [object] Configuration options for the class [object].
	constructor( options={} ) {
		super( options ); // call parent constructor
	}

	//-------------------------
	// Event Methods
	//-------------------------
	// Registers a DOM-specific callback under an event name.
	// RETURNS: [boolean] `true` on success else `false` on fail.
	// * command		- [string] Name of the event to register under.
	//   id				- [string] Unique ID for the callback.
	//   callback		- [Function] The callback function.
	//   type			- [string] Type of callback (default: 'manual').
	//   iterations		- [number|null] How many times the callback can be invoked (null = unlimited).
	//   data			- [Object] Optional additional data about the callback. Do not use "data.status"
	register( command, id, callback, type='manual', iterations=null, data={} ) {
		// Handle multiple commands.
		if ( Array.isArray(command) ) {
			let allRegistered = true;
			command.forEach(
				cmd => {
					const result = this.register( cmd, id, callback, type, iterations, { ...data } );
					if ( result===false ) allRegistered = false;
				});
			return allRegistered;
		}

		// Ensure DOM listener status is defined.
		data.status = 'unbound';

		// Call the super register method.
		const registered	= super.register( command, id, callback, type, iterations, data );
		if ( registered===false ) return false;

		// Attach event listener if applicable.
		if ( ['window','dom','document'].includes(type) )
			this._toggleEventListener( command, id ); // Bind the event.

		return true; // success
	}

	//--------------------------------
	// Unregister DOM Callback(s)
	//--------------------------------
	// Unregisters one or more callbacks by event name(s).
	// RETURNS: [void] Nothing.
	// * command	– [string|array] Event name or array of event names.
	// * id			– [string] ID of the callback to remove.
	unregister( command, id ) {
		// Handle multiple commands.
		if ( Array.isArray(command) ) {
			command.forEach( cmd => this.unregister(cmd,id) );
			return;
		}

		// Determine if event listener needs removed.
		const handler = this.handlers?.[command]?.find( h => h.id===id );
		if ( handler && ['dom','window','document'].includes(handler.type) )
			// Detach DOM listener if necessary.
			this._toggleEventListener( command, id, false );

		// Remove callback from internal handler stack.
		super.unregister( command, id );
	}

	// Ensure 'dom' handlers are attached as DOM listeners to `el`
	// from the `callbacks` option during initialization (stored in this.handlers).
	// RETURNS: [void] Nothing.
	_attachEventListeners() {
		// Validate handlers.
		if ( !this.handlers || typeof this.handlers!=='object' ) return;
		// Iterate over each registered command.
		for ( const [command, callbacks] of Object.entries(this.handlers) ) {
			if ( !Array.isArray(callbacks) ) {
				console.warn( `Invalid callbacks array for command: "${command}"` );
				continue;
			}
			// Attach each callback associated with the command.
			callbacks.forEach(
				( handler, index ) => {
					try {
						// Skip if iterations is exceeded.
						if ( handler.iterations!==null && handler.iteration>=handler.iterations ) {
							console.warn( `Skipping callback "${handler.id}" for command "${command}" as it has exceeded max invocations.` );
							return;
						}
						// Attach the event listener.
						this._toggleEventListener( command, handler.id, true );
					}
					catch ( error ) {
						console.error( `Failed to attach event for command "${command}" with ID "${handler.id}":`, error );
					}
				});
		}
	}

	//-------------------------
	// Private Methods
	//-------------------------
	// Toggles (binds or unbinds) a DOM event listener.
	// RETURNS: [bool] `true` on success or `false` on fail.
	// * command	- [string] Name of the DOM event to toggle.
	//   id			- [string] ID of the callback to toggle.
	//   bind		- [bool] True to bind, false to unbind.
	// Toggles (binds or unbinds) a DOM event listener.
	_toggleEventListener( command, id, bind=true ) {
		// Validate handler and determine target element.
		const handler = this.handlers?.[command]?.find( (h)=>h.id===id );
		let target = null;
		if ( !handler ) {
			//console.warn( `Handler with ID "${id}" not found for command "${command}".` );
			return false;
		}

		//-------------------------
		// Handle DOM & Window event
		//-------------------------
		// DOM element event listener
		if ( handler.type==='dom' ) {
			if ( jsos.datatype(this.el,'dom') )
				target = this.el;
			else {
				console.warn( `Invalid target for DOM event "${command}" with ID "${id}".` );
				return false;
			}
		}
		// Window event listener
		else if ( handler.type==='window' )
			target	= window;
		// Document event listener
		else if ( handler.type==='document' )
			target	= document;

		//-------------------------
		// Proceed to Bind / Unbind Listener
		//-------------------------
		// Ensure valid target is set.
		if ( !target ) {
			console.warn( `No valid target for event "${command}" with ID "${id}".` );
			return false;
		}

		// Bind or unbind the event listener.
		if ( bind && handler.data.status==='unbound' ) {
			target.addEventListener( command, handler.callback, handler.data );
			handler.data.status = 'bound';
			return true;
		}
		else if ( !bind && handler.data.status==='bound' ) {
			target.removeEventListener( command, handler.callback );
			handler.data.status = 'unbound';
			return true;
		}

		// Return false if no action was taken.
		return false;
	}
}
