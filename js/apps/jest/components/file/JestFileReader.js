console.log( 'jestAlert: js/dom/element/JestFileReader.js loaded' );

//-----------------------------
// JestFileReader
//-----------------------------
// Class for reading & writing a local file.
class JestFileReader extends JestGamepiece {
	// File properties
	reader			= null;				// [FileReader] Internal FileReader object
	file			= null;				// File [object] from local machine.
	result			= null;				// [...] Stores read file data result.
	// Flags & switches
	datatype		= 'dataURL';		// [string] How to read: dataURL, text, arrayBuffer, binaryString

	//-----------------------------
	// Constructor
	//-----------------------------
	// Creates the file reader [object].
	// * client		- client [object] that this piece belongs to.
	constructor( client ) {
		// Call parent constructor
		super( client ); // construct the parent
		// Instantiate FileReader [object].
		this.reader		= new FileReader();
		// Set initial status mode.
		this.jot( 'status', 'unloaded' );
	}

	//-------------------------
	// Read Next File
	//-------------------------
	// Starts reading a requested local file.
	// RETURNS: [bool] true if a file was started.
	// * file - [File] Single file to add.
	readFile( file ) {
		// Determine if file is already loading
		const status	= this.skim( 'status' )
		// Skip if already reading or queue is empty
		if ( status!=='unloaded' || !file ) return false;
		// Store file data.
		if ( file ) this.file = file;
		this.jot( 'status', 'reading' ); // update status
		// Register all FileReader events
		this.reader.addEventListener( 'loadstart',  e => this.onStart(e), false );
		this.reader.addEventListener( 'progress',   e => this.onProgress(e), false );
		this.reader.addEventListener( 'load',       e => this.onLoad(e), false );
		this.reader.addEventListener( 'error',      e => this.onError(e), false );
		this.reader.addEventListener( 'abort',      e => this.onAbort(e), false );
		this.reader.addEventListener( 'loadend',    e => this.onEnd(e), false );
		// Choose correct read mode
		switch ( this.datatype ) {
			case 'text':			this.reader.readAsText( this.file ); break;
			case 'binaryString':	this.reader.readAsBinaryString( this.file ); break;
			case 'arrayBuffer':		this.reader.readAsArrayBuffer( this.file ); break;
			default:				this.reader.readAsDataURL( this.file ); break;
		}
		return true;
	}

	//-----------------------------
	// FileReader Events
	//-----------------------------
	// Triggered when reading starts.
	// * e - [Event] loadstart event.
	onStart( e ) {
		this.emit( 'loadstart', null, { file: this.file, event: e } );
	}
	// Triggered during file reading progress.
	// * e - [ProgressEvent] progress event.
	onProgress( e ) {
		this.emit( 'progress', null, { file: this.file, event: e } );
	}
	// Triggered when a file is successfully fully read.
	// * e - [Event] load event.
	onLoad( e ) {
		// Access file & store result data.
		const result	= e.target.result;
		this.result		= result; // store result
		this.jot( 'status', 'ready' ); // update status
		// Emit onLoad registered event callbakcs
		this.emit( 'load', null, { file: this.file, result } );
	}
	// Triggered on file read failure.
	// * e - [Event] error event.
	onError( e ) {
		this.jot( 'status', 'failed' ); // update status
		this.emit( 'error', null, { file: this.file, event: e } );
	}
	// Triggered if reading was aborted.
	// * e - [Event] abort event.
	onAbort( e ) {
		this.jot( 'status', 'canceled' ); // update status
		this.emit( 'abort', null, { file: this.file, event: e } );
	}
	// Triggered when reading completes (success or failure).
	// * e - [Event] loadend event.
	onEnd( e ) {
		// Free up some memory.
		this.reader		= null;
		// Emit event.
		this.emit( 'loadend', null, { file: this.file, event: e } );
	}
}
