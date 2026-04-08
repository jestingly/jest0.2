console.log( 'jestAlert: js/apps/jest/components/editing/type/subtype/JestFileLevel.js loaded' );

//-------------------------
// JestFileLevel Class
//-------------------------
// A system file class for loading and viewing loaded level file data.
class JestFileLevel extends JestFileImage {
	// Object properties
	//modes			= null;				// [array] of possible modes.

	// --------------------------------
	// Constructor
	// --------------------------------
	// Construct the [object].
	// RETURNS: [void].
	// * client		- client [object] that this piece belongs to.
	// * origin		- [string] Value of file data origin ("local", "remote", etc.).
	// * stem		- [string] Value of stem (e.g. 'level1').
	constructor( client, origin, stem ) {
		super( client, origin, stem, 'nw' ); // call parent constructor
	}

	//-------------------------
	// Teardown Method(s)
	//-------------------------
	// Destroy the view [object]
	// RETURNS: [void].
	destroy() {
		// Call parent constructor.
		super.destroy(); // parent destroy()
		// Delete [object] references.
		this.data		= null;
		this.context	= null;
	}

	//--------------------------------
	// Set JestLevel [object]
	//--------------------------------
	// Build the element [object].
	// RETURNS: [boolean] `true` on success else `false` on fail.
	// * context	- pre-loaded & rendered JestLevel [object].
	setContext( context ) {
		// Validate argument(s).
		if ( !(context instanceof JestLevel) ) {
			console.warn( `Argument "context" must be of type JestLevel.` );
			return false; // fail
		}
		// Set context reference.
		console.log( `Setting JestLevel [object] as "context".` );
		this.context	= context ?? null;
		return true; // success
	}

	//--------------------------------
	// Load File Data as JestLevel [object]
	//--------------------------------
	// Open a level file.
	// RETURNS: [boolean] `true` on success else `false` on fail.
	// * fileInfo	- [object] { path, handle, file, data } or [null] for new.
	async openFile( fileInfo ) {
		//--------------------------------
		// Create New Level [object]
		//--------------------------------
		// Call parent to begin opening the file.
		await super.openFile( fileInfo );	// pass file info to parent
		const stem		= this.stem;		// Use filename "stem" as shorthand for filename.
		// Create a new level [object] with filename stem.
		const level		= new JestLevel( this.client, stem );
		await level.setup(); // setup new [object]
		// Create variables that will be loaded in.
		let board		= [];
		let regions		= {};
		console.log( JestParserLevel.keywords );

		//--------------------------------
		// Build Empty Level
		//--------------------------------
		// Create empty level if no file opened.
		if ( fileInfo.network==='none' ) {
			console.log( 'No File Data Supplied: Generating level using empty file data...' );
			// Choose base generic tile @ index (0,0)
			const baseTile		= { ts: 0, tx: 0, ty: 0 };
			// level is your JestLevel instance
			const levelGrid		= this.client.config.levelGrid; // level WxH
			board	= this.client.grapher.createMatrix( levelGrid, levelGrid, baseTile );
			// Dynamically assign regions via parser keyword registration
			for ( const keyword of JestParserLevel.keywords ) {
				const key		= keyword.toLowerCase();
				if ( key==='board' ) continue;
				regions[key]	= []; // empty region (by default)
			}
		}

		//--------------------------------
		// Generate Level From File Data
		//--------------------------------
		else {
			console.log( 'File Data Supplied: Generating level using file data...' );
			// Attempt to get the file record.
			const secretary		= this.client.secretary;	// secretary [object]
			const transmitter	= this.client.transmitter;	// transmitter [object]
			const record		= secretary.getRecord( fileInfo.address, 'local' );
			// Remove record from secretary & transmitter cache.
			secretary.removeRecord( fileInfo.address, 'local' );
			transmitter.removeFromCache( fileInfo.address, true );
			// Get tile board data from the read file.
			console.log( record );
			board	= record.board; // board from parsed file
			// Dynamically assign regions via parser keyword registration
			for ( const keyword of JestParserLevel.keywords ) {
				const key		= keyword.toLowerCase();
				if ( key==='board' ) continue;
				regions[key]	= record[key] ?? [];
			}
		}
		console.log( regions );

		//--------------------------------
		// Render Tilemap Into Level
		//--------------------------------
		console.log( `Converted "${stem}" successfully into level [object]!` );
		// Load-in retrieved or generated board data & render its bitmap in the level [object].
		console.log( `Rendering "${stem}" level data into level [object]...` );
		// Set new level as this file [object] context.
		try {
			level.render( board ); // populates level.tilemap and calls blit()
		}
		catch ( err ) {
			console.error( 'Could not render level using supplied board data.' );
		}

		//--------------------------------
		// Finish & Set Context
		//--------------------------------
		// Set the level context.
		this.setContext( level );

		//-----------------------------
		// Emit Various Event(s)
		//-----------------------------
		// Emit a load file event with data [objects].
		this.emit( 'openFile', null, { board, ...regions } );
		return true; // success
	}

	//-------------------------
	// Save to Disk
	//-------------------------
	// Save the current data to disk using File System Access API (or fallback).
	// • Try primary save method
	// 	- if success → return true
	// 	- if user canceled → return false (skip fallback!)
	// 	- if error → fallback (if allowed)
	// RETURNS: [Promise<boolean>] true on success.
	// * method		- [string] Value: "new", "overwrite", "cloud", "download"
	// * fallback	- [bool] Allow fallback forced download (default: true)
	async saveToDisk( method="overwrite", fallback=true ) {
		// Convert level tilemap to .nw file [string] syntax.
		const tilemap	= this.context.tilemap; // 2D [array] of

		// Generate list of all dynamic keyword data.
		const keywordData = {};
		for ( const keyword of JestParserLevel.keywords ) {
			const key	= keyword.toLowerCase();
			if ( key==='board' ) continue;
			// Check for keyword stack in the queue.
			const data	= this.dequeue( key );
			if ( data!==null ) {
				keywordData[key] = data; // add to stack for encoding
				console.log( `✔ Saving region: ${key} (${data.length} objects)` );
			}
		}

		// Build data to save using parsd queued data.
		this.data		=
			this.client.parsers.level.encode({
				board: tilemap,
				...keywordData
				});
		// Get tilemap from level & convert to string.
		//this.data	= JSON.stringify( this.context.tilemap );

		// Save data to file on local disk.
		switch ( method ) {
			case "cloud":
				// Check for cloud handler.
				if ( this.client.cloud ) {
					// Get JestCloud [object]
					await this.client.cloud.save( this, "manual" );
				}
				break;
			case "download":
			case "overwrite":
			case "new":
				const forceSaveAs = method==="new" ? true : false;
				super.saveToDisk( 'text/plain', forceSaveAs, fallback );
				break;
		}
	}
}
