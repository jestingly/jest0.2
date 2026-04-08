console.log( 'jestAlert: js/apps/jest/components/image/JestGraphic.js loaded' );

//-------------------------
// JestGraphic Class
//-------------------------
// JestGraphic instance that encapsulates the parsed audio data.
class JestGraphic extends JestSavable {
	// Loading properties
	address		= null;		// [string] image source URL
	network		= null;		// [string] protocol source: 'local', 'remote'
	// Image properties
	objectURL	= null;		// [string] URL created from blob
	canvas		= null;		// [ElementCanvas] used to render image
	file		= null;		// [ElementImage] loaded image element

	//-------------------------
	// Constructor
	//-------------------------
	// Construct the [object].
	// * client		- [object] Application client creating the object.
	// * name		- [string] Value of level name (e.g. 'level1').
	// * address	- [string] Full path to image file, with filename + extension.
	//   network	- [string] One of: 'local', 'remote'
	constructor( client, name, address, network ) {
		// Call the parent object constructor
		super( client, name );		// construct the parent
		this.address	= address;	// [string] of image source URL
		this.network	= network;	// [string] of image data souce
	}

	//-------------------------
	// Initialization Methods
	//-------------------------
	// Setup the object [object].
	// RETURNS: [boolean] `true` on success else `false` on fail.
	async setup() {
		// Set initial status.
		this.jot( 'image', 'unloaded' );
		//-------------------------
		// Build File
		//-------------------------
		this.build();			// build the object
		//-------------------------
		// Load File Data
		//-------------------------
		await this.load();		// load the data
		return true;			// success
	}

	// Build the [object].
	// RETURNS: [boolean] `true` on success else `false` on fail.
	build() {
		//-------------------------
		// Create Canvas (to print image on)
		//-------------------------
		// Create and store canvas.
		const canvas	= new ElementCanvas( this.client );
		this.canvas		= canvas;	// set canvas
		canvas.resize( 0, 0 );		// resize to nothing
		return true; // success
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

	// Receive and render image blob.
	// RETURNS: ElementImage [object] on success else [null] on fail.
	// * blob		- [object] Blob of loaded audio data.
	async render( blob ) {// Receive and render image blob
		//-------------------------
		// Validate Argument(s)
		//-------------------------
		// Check if datatype is a blob.
		if ( !(blob instanceof Blob) ) {
			console.warn( `JestGraphic.render() requires Blob, got: ${typeof blob}` );
			return null; // empty value
		}

		//-------------------------
		// Set objectURL
		//-------------------------
		// Cleanup previous object URL
		if ( this.objectURL )
			URL.revokeObjectURL( this.objectURL );
		this.objectURL	= URL.createObjectURL( blob );

		//-------------------------
		// Create Image [object]
		//-------------------------
		// Create ElementImage and assign src
		this.file	= new ElementImage( { objectURL: this.objectURL } );

		//-------------------------
		// Register onLoad Event
		//-------------------------
		// Add image load event (fallback in case initial draw fails).
		this.file.register( 'loaded', 'imgLoad', ()=>this.draw() );
		this.draw(); // attempt initial draw
		return this.file; // return image
	}

	//-------------------------
	// Draw Image
	//-------------------------
	// Checks if the image is ready & copies the canvas to match if yes.
	// RETURNS: [void].
	draw() {
		//-------------------------
		// Status Gate(s)
		//-------------------------
		// Determine if media is ready
		const imgStatus	= this.file?.skim( 'source' );
		// Require image to be complete.
		if ( imgStatus!=='loaded' ) return; // skip
		// Check if media is already drawn.
		const status	= this.skim( 'image' )
		if ( status==='drawn' ) return;	// skip
		this.jot( 'image', 'drawn' );	// change image status to "drawn"

		//-------------------------
		// Copy Image to Canvas
		//-------------------------
		// Draw image on canvas for quick access.
		this.canvas.copyImage( this.file, true, true );

		//-------------------------
		// Emit Final Event(s)
		//-------------------------
		this.emit( 'drawn' ); // drawn
	}

	//-------------------------
	// Destroy Image
	//-------------------------
	// Releases the object URL when the image asset is no longer needed.
	// RETURNS: [void].
	destroy() {
		// Release objectURL
		if ( this.objectURL ) {
			URL.revokeObjectURL( this.objectURL );
			this.objectURL = null;
		}
		// Clear ElementImage from memory.
		this.file	= null;
	}
}
