//-------------------------------------------------------
// JEST ® All Rights Reserved
// Antago (God of Gravity), author of Graal2001 & Destiny
// Copyright ® 1999-2026
//-------------------------------------------------------
console.log( 'jestAlert: js/apps/jest/components/sound/JestSound.js loaded' );

//-------------------------
// JestSound Class
//-------------------------
// JestSound instance that encapsulates the parsed audio data.
class JestSound extends JestSavable {
	// Container properties
	audios			= [];			// [array] of currently active Audio instances.
	// Default audio properties
	volume			= 0.2;			// [float] Default volume (20%).
	maxload			= 10;			// [int] maximum ElementAudio [objects]
	objectURL		= null;			// [string] value of objectURL for preloaded data.

	// --------------------------------
	// Constructor
	// --------------------------------
	// Construct the [object].
	// * client		- [object] Application client creating the object.
	// * name		- [string] Value of level name (e.g. 'level1').
	constructor( client, name ) {
		// Call the parent object constructor
		super( client, name );			// construct the parent
	}

	//-------------------------
	// Initialization Methods
	//-------------------------
	// Setup the object [object].
	// RETURNS: [boolean] `true` on success else `false` on fail.
	async setup() {
		// --------------------------------
		// Build Level
		// --------------------------------
		this.build();					// build the object
		// --------------------------------
		// Load File(s) Data
		// --------------------------------
		await this.load();				// load the data
		return true;					// success
	}

	// Build the [object].
	// RETURNS: [boolean] `true` on success else `false` on fail.
	build() {
		return true;		// success
	}

	//-------------------------
	// Data Handling
	//-------------------------
	// Load the data.
	// RETURNS: [boolean] `true` on success else `false` on fail.
	async load() {
		super.load();			// call parent load start method
		this.complete();		// call complete method
		return true;			// success
	}

	// Complete data load.
	// RETURNS: [boolean] `true` on success else `false` on fail.
	complete() {
		super.complete();		// call parent complete method
		return true;			// success
	}

	// Receive and store blob as sound.
	// RETURNS: ElementAudio [object] on success else [null] on fail.
	// * blob		- [object] Blob of loaded audio data.
	render( blob ) {
		if ( !jsos.prove(blob,'object') ) {
			throw new Error( 'Invalid parsed defs. Must be an object.' );
			return null; // empty value
		}
		// Create an object URL for the blob.
		const objectURL	= URL.createObjectURL( blob );
		this.objectURL	= objectURL; // store objectURL for blob
		return true; // success
	}

	//-------------------------
	// Create Audio [object]
	//-------------------------
	// Creates a new HTMLAudioElement using the stored objectURL.
	// RETURNS: [object] ElementAudio, else `false` on fail.
	// * volume		- [float] Playback volume (default: this.volume).
	createInstance( volume=this.volume ) {
		// --------------------------------
		// Create Audio [object]
		// --------------------------------
		// Create the audio element [object]
		const audio		= new ElementAudio( { objectURL: this.objectURL, queued: true } );
		audio.setVolume( volume );	// ensures volume is stored and applied properly
		const instance	= { audio, playing: false };
		this.audios.push( audio );	// store audio in stack
		return audio;
	}

	//-------------------------
	// Playback Handling
	//-------------------------
	// Finds an available instance or creates a new one.
	// * volume		- [float] Playback volume.
	play( volume=null, simultaneous=true ) {
		// Check for an existing idle audio instance
		let audio	= this.audios.find( a=>this.recyclable(a) );
		// Create new instance if needed
		if ( !audio && (simultaneous || this.audios.length<1) )
			audio	= this.createInstance( volume );
		// Play the audio if available
		if ( audio ) audio.play( volume );
	}

	// Pauses all currently playing instances.
	// RETURNS: [void].
	pause() {
		// Iterate all ElementAudio [objects] & pause
		this.audios.forEach( a => audio.pause() );
	}

	// Stops (pauses and resets) all currently playing instances.
	// RETURNS: [void].
	stop() {
		// Iterate all ElementAudio [objects] & stop
		this.audios.forEach( a => audio.stop() );
	}

	//-------------------------
	// Seek Reusable Instance
	//-------------------------
	recyclable( audio ) {
		// Get HTMLAudioElement
		const { el } 	= audio;
		// Access audio playback status
		const playback	= audio.skim( 'playback' );
		// Determine if audio is playing
		return playback!=='playing' && ( el.ended || el.paused || el.currentTime===0 );
	}

	//-------------------------
	// Periodic Cleanup
	//-------------------------
	cleanup() {
		// Keep a max of "maxInstances" # stored unless more are playing
		const maxInstances = Math.max( this.maxload, this.audios.filter(a=>a.playing).length );
		if ( this.audios.length>maxInstances ) {
			//console.log( `Cleaning up ${this.audios.length - maxInstances} unused audio instances.` );
			this.audios = this.audios.filter( a=>a.playing ).slice( 0, maxInstances );
		}
	}

	//-------------------------
	// Destroy Audio
	//-------------------------
	// Releases the object URL when the audio asset is no longer needed.
	// RETURNS: [void].
	destroy() {
		clearInterval( this.cleanupInterval ); // Stop automatic cleanup
		// Stop all audio files
		this.audios.forEach( a=>a.el.stop() );
		// Remove audio [objects] from [array]
		this.audios	= [];
		// Release objectURL
		if ( this.objectURL ) {
			URL.revokeObjectURL( this.objectURL );
			this.objectURL = null;
		}
	}
}
