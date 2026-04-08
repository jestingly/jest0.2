console.log( 'jestAlert: js/apps/jest/components/animation/JestJani.js loaded' );

//-------------------------
// JestJani Class
//-------------------------
// Class for generating & handling "jani" (sequences of assembled sprites) objects.
class JestJani extends JestSavable {
	// Object properties
	canvas			= null;			// ElementCanvas [object]
	stamp			= null;			// ElementCanvas [object] used for tile stamping
	animation		= null;			// AnimationAnimation [object]
	span			= null;			// [int] Value of square WxH
	fallback		= null;			// [string] Fall back image path.

	//-------------------------
	// Constructor
	//-------------------------
	// Construct the [object].
	// * client		- [object] Application client creating the object.
	// * name		- [string] Value of jani name (e.g. 'jani1').
	//   span		- [int] Value of span (WxH), defaults to client.config.janiSpan
	constructor( client, name, span ) {
		// Call the parent object constructor
		super( client, name );					// construct the parent
		this.jot( 'status', 'constructed' );	// set status
		// Set square WxH span
		if ( !jsos.argues({span:[span,'int']}) || span<1 )
			span	= this.client.config.janiSpan;
		this.span	= span; // set the square WxH dimensions
		// Set the fallback image.
		this.fallback	= 'web/unknown.png';
	}

	//-------------------------
	// Teardown Method(s)
	//-------------------------
	// Destroy the JANI [object]
	// RETURNS: [void].
	destroy() {
		//--------------------------------
		// Check if Already Destroyed
		//--------------------------------
		// Prevent double‐destroy
		if ( this.skim('status')==='destroyed' ) return;
		this.jot( 'status', 'destroyed' );
		// Unregister any listeners on this.anchor
		/*if ( this.anchor && this.anchor.unregisterAll )
			this.anchor.unregisterAll();*/

		//--------------------------------
		// Clear & remove main canvas
		//--------------------------------
		if ( this.canvas && this.canvas.el ) {
			this.canvas.el.getContext('2d').clearRect( 0, 0, this.canvas.el.width, this.canvas.el.height );
			this.canvas.el.remove(); // detach from DOM
		}

		//--------------------------------
		// Clear & remove stamp canvas
		//--------------------------------
		if ( this.stamp && this.stamp.el ) {
			this.stamp.el.getContext('2d').clearRect( 0, 0, this.stamp.el.width, this.stamp.el.height );
			this.stamp.el.remove();
		}

		//--------------------------------
		// Remove from fantascope registry
		//--------------------------------
		if ( this.client?.fantascope )
			this.client.fantascope.removeFile( this.name );

		//--------------------------------
		// Null out references
		//--------------------------------
		this.animation	= null;

		//--------------------------------
		// Call parent destroy (if exists)
		//--------------------------------
		if ( super.destroy ) super.destroy();
	}

	//-------------------------
	// Initialization Methods
	//-------------------------
	// Setup the object [object].
	// RETURNS: [boolean] `true` on success else `false` on fail.
	async setup() {
		//--------------------------------
		// Check if Ready to Setup
		//--------------------------------
		// Check if setup is possible.
		const status	= this.skim( 'status' );
		if ( status!=='constructed' ) return false;

		//--------------------------------
		// Build Jani
		//--------------------------------
		// Set status as building & attempt to build.
		this.jot( 'status', 'building' );	// set status
		this.build();						// build the object

		//--------------------------------
		// Load File(s) Data
		//--------------------------------
		// Set status as loading & attempt to load.
		this.jot( 'status', 'loading' );	// set status
		await this.load();					// load the data
		this.jot( 'status', 'empty' );		// set status
		return true; // success
	}

	// Build the [object].
	// RETURNS: [boolean] `true` on success else `false` on fail.
	build() {
		//--------------------------------
		// Check Status (Security Gate)
		//--------------------------------
		// Check if setup is possible.
		const status	= this.skim( 'status' );
		if ( status!=='building' ) return false;
		//--------------------------------
		// Create Drawing [objects]
		//--------------------------------
		// Create the jani rendering element canvas [object]
		const canvas	= new ElementCanvas();
		this.canvas		= canvas;
		// Update canvas dimensions
		const janiSpan	= this.client.config.janiSpan;
		canvas.resize( janiSpan, janiSpan );
		// Create a canvas for clip stamping onto jani element canvas [object]
		const stamp		= new ElementCanvas();
		this.stamp		= stamp;
		//--------------------------------
		// Setup Sizing Method(s) [object]
		//--------------------------------
		/*// Add resize event handler for canvas updating
		this.anchor.register( 'resize', 'jani', (w,h)=>this.resize(w,h) );
		// Set tile size
		this.anchor.graticulate( this.client.config.tileGrid );
		// Set jani width & height
		this.anchor.resize( this.client.config.janiGrid, this.client.config.janiGrid );*/
		return true;		// success
	}

	//-------------------------
	// Data Handling
	//-------------------------
	// Load the data.
	// RETURNS: [boolean] `true` on success else `false` on fail.
	async load() {
		// Check if setup is possible.
		const status	= this.skim( 'status' );
		if ( status!=='loading' ) return false;
		super.load();		// call parent load start method
		this.complete();	// call complete method
		return true;		// success
	}

	// Complete data load.
	// RETURNS: [boolean] `true` on success else `false` on fail.
	complete() {
		super.complete();	// call parent complete method
		return true;		// success
	}

	//--------------------------------
	// Set AnimationAnimation [object] to JANI
	//--------------------------------
	// Stores a valid AnimationAnimation [object] inside this JANI instance.
	// RETURNS: [boolean] `true` on success, else `false` on invalid input.
	// * animation	- [object] AnimationAnimation to assign.
	setAnimation( animation ) {
		//--------------------------------
		// Validate Argument(s)
		//--------------------------------
		// Require animation to be [AnimationAnimation].
		if ( !(animation instanceof AnimationAnimation) ) {
			console.warn( `JestJani addAnimation() received invalid animation.` );
			return false; // escape
		}

		//--------------------------------
		// Assign Internal Animation Ref
		//--------------------------------
		this.animation	= animation;
		return true; // success
	}

	//--------------------------------
	// Retrieve Internal AnimationAnimation [object]
	//--------------------------------
	// RETURNS: [object] AnimationAnimation if set, else `null`.
	getAnimation() {
		// Return Animation reference or [null].
		return (this.animation instanceof AnimationAnimation)
			? this.animation
			: null;
	}

	//--------------------------------
	// Add Animation View
	//--------------------------------
	// Attempt to add a new view to an animation.
	// RETURNS: AnimationView [object] or `false` on fail.
	// * name	- [string] Value of view name to add (e.g. 'player1').
	addView( name ) {
		//--------------------------------
		// Require Propert(ies)
		//--------------------------------
		// Ensure animation [object] is loaded.
		const ani	= this.getAnimation();
		if ( !ani )
			throw new Error( `JestJani view() cannot create view while this.animation=null` );

		//--------------------------------
		// Validate Arguments
		//--------------------------------
		// Name must be of type [string].
		if ( !jsos.argues({name:[name,'string']}) ) {
			console.warn( `Invalide argument for 'name' supplied.` );
			return false; // escape
		}

		//--------------------------------
		// Create New View & Center It
		//--------------------------------
		// Create a new animation view.
		const view	= ani.addView( name );
		// Resize & center the view.
		if ( view ) {
			view.resize( this.span, this.span );	// set animation width/height
			const aniCenterX	= -view.width / 2;
			const aniCenterY	= -view.height / 2;
			view.move( aniCenterX, aniCenterY );
			return view; // return created AnimationView [object]
		}
		else {
			console.warn( `JestJani view() failed to create view: '${name}'.` );
			return false; // escape
		}
	}

	// Set the image of an animation group.
	// RETURNS: [boolean] `true` on success else `false` on fail.
	// * viewName	- [string] Animation view name ('user1').
	// * groupName	- [string] JANI group name ('HEAD', 'ATTR1', etc.).
	// * address	- [string] Full path to image file, with filename + extension.
	//   network	- [string] One of: 'local', 'remote'
	async setGroupImage( viewName, groupName, address, network='remote' ) {
		//--------------------------------
		// Validate Arguments
		//--------------------------------
		// View name & group name must be a [string].
		if ( !jsos.argues({viewName:[viewName,'string'], groupName:[groupName,'string']}) ) {
			console.warn( `JestJani getImage(), invalid argument(s). viewName: ${viewName}, groupName: ${groupName}` );
			return false; // invalid args
		}

		//--------------------------------
		// Access Target Animation View
		//--------------------------------
		// Attempt to access the animation view [object]
		const view	= this.animation.getView( viewName );
		if ( !(view instanceof AnimationView) ) {
			console.warn( `Animation '${this.name}' view not found: ${viewName}` );
			return false; // abort
		}
		// Check if JANI view group exists.
		if ( !this.animation.hasGroup(groupName) ) {
			// Abort and do not throw error, as it is a soft err.
			//console.warn( `Animation '${this.name}' does not contained a group called: ${groupName}` );
			return false; // abort
		}

		//--------------------------------
		// Allow Nullification
		//--------------------------------
		// If address is [null], simply set & return.
		if ( address===null ) {
			view.setGroup( groupName, null );
			console.log( `JestJani view '${viewName}': Successfully nullified image for group '${groupName}'!` );
			return true; // success
		}

		//--------------------------------
		// Parse Path Information
		//--------------------------------
		// Get file info using the address.
		const fileInfo	= this.client.getFileInfo( address, null, null, null, network );
		const { filename } = fileInfo; // extract vars

		//--------------------------------
		// Validate Filetype(s)
		//--------------------------------
		// Allowed types.
		const extension	= fileInfo.extension; // filetype extension [string]
		if ( !this.client.imager.filetypes.includes(extension) ) {
			console.warn( `Unknown requested file type: ${extension}` );
			return false; // abort
		}

		//--------------------------------
		// Load [ElementImage] File Blocking
		//--------------------------------
		// Attempt to get the asset.
		let asset;
		asset	= await this.client.imager.getFile( fileInfo.address, network );
		/*if ( network==='remote' )
		else if ( network==='local' )
			asset	= await this.client.imager.readFile( fileInfo.address, 'local' );
		else {
			console.warn( `setGroupImage() invalid argument for "network": ${network}` );
			return false; // abort
		}*/
		//console.log( `JestJani view '${viewName}': Attempting to set image '${address}' for group '${groupName}'...` );

		//--------------------------------
		// Fallback if Null
		//--------------------------------
		// If image asset fails to load, load a fallback.
		if ( !asset ) {
			// Use supplied stem or fallback to default.
			const fallback	= this.animation.getGroup(groupName) ?? fallback;
			console.warn(
				`JestJani view '${viewName}': Image '${address}' not found, defaulting to fallback '${fallback}' for group '${groupName}'.` );
			// Attempt to load the fallback image.
			asset	= await this.client.imager.loadFile( fallback );
		}
		// If the asset still missing, abort.
		if ( !asset?.file?.el ) {
			console.error( `JestJani view '${viewName}': Failed to load any image for group '${groupName}'.` );
			return false; // abort
		}

		//--------------------------------
		// Set ElementImage Ref In View Group
		//--------------------------------
		// Set ElementImage as group
		//console.log( this.animation );
		view.setGroup( groupName, asset );
		console.log( `JestJani view '${viewName}': Successfully changed image for group '${groupName}' to '${address}'!` );
		return true; // Success
	}

	//--------------------------------
	// Retrieve Animation View Image
	//--------------------------------
	// Gets the ElementImage or [object] currently set on a given animation view's group.
	// RETURNS: [object|null] The asset (e.g., ElementImage) or null if missing.
	// * viewName	- [string] Animation view name (e.g., 'user1')
	// * groupName	- [string] JANI group key (e.g., 'HEAD', 'ATTR1')
	getImage( viewName, groupName ) {
		//--------------------------------
		// Validate Argument(s)
		//--------------------------------
		// View name & group name must be a [string].
		if ( !jsos.argues({viewName:[viewName,'string'], groupName:[groupName,'string']}) ) {
			console.warn( `JestJani getImage(), invalid argument(s). viewName: ${viewName}, groupName: ${groupName}` );
			return null; // invalid args
		}

		//--------------------------------
		// Ensure Animation & View Exist
		//--------------------------------
		// Ensure animation is set.
		if ( !(this.animation instanceof AnimationAnimation) ) {
			console.warn( `JestJani getImage(), no animation set on JANI: '${this.name}'` );
			return null; // abort
		}
		// Seek requested view.
		const view = this.animation.getView( viewName );
		if ( !(view instanceof AnimationView) ) {
			console.warn( `JestJani getImage(), missing view '${viewName}' in animation.` );
			return null; // abort
		}

		//--------------------------------
		// Ensure Group Exists
		//--------------------------------
		// Check if group exists.
		if ( !this.animation.hasGroup(groupName) ) {
			console.warn( `JestJani getImage(), group '${groupName}' not found in animation.` );
			return null; // abort
		}

		//--------------------------------
		// Retrieve Asset Reference
		//--------------------------------
		// Seek requested image asset stored inside view's group.
		const asset = view.getGroup( groupName );
		if ( !asset ) {
			console.error( `JestJani getImage(), no image found for '${groupName}' in view '${viewName}'.` );
			return null; // abort
		}

		return asset; // return valid reference
	}
}
