console.log( 'jestAlert: js/apps/jest/components/clients/JestCreator.js loaded' );

//-------------------------
// Jest Application
//-------------------------
class JestCreator extends Jest {
	// Declare properties
	icon			= 'images/icons/jest_settings.png'; // application icon image URL [string] value
	name			= 'Creator';		// name of application
	version			= '0.1beta';		// application version
	id				= 'creator';		// creator application id.
	// Server [objects]
	//online			= null;			// [object] JestOnline for connection to a websocket.
	// JestElement Reference(s)
	filetypes		= '*';				// Comma lineated [string] of permitted open filetype(s)
	filemenu		= null;				// [JestFileMenu] File operation button bar
	fileSelect		= null;				// [object] JestInputFileSelect for file selection.
	// Tabbar menu(s)
	tabbarFile		= null;				// [JestTabbar] tools for file view selection.
	// Tool handling
	easels			= null;				// [object] of easels that hold file views.
	toolbar			= null;				// [JestToolbar] Tool menu selector (draw, fill, etc.)
	toolbox			= null;				// [JestToolbox] Central tool manager for enabling/disabling tools and temp swaps
	interactor		= null;				// [JestToolbar] Interactor menu for interactive tool actions.
	// Editor area
	editor			= null;				// [object] Panel container for editing arena (board & sidebar).
	board			= null;				// [JestElement] Board for editing the file.
	sidebar			= null;				// [JestSidebar] Sidebar menu for actions & palette.
	// User login handling
	userBadge		= null;				// [JestPanel] User login/logout badge element.

	// --------------------------------
	// Constructor
	// --------------------------------
	// Construct the [object].
	// * options	- [object] Configuration options for the application.
	constructor() {
		// Call the parent application constructor
		super();
	}

	// --------------------------------
	// Initialization
	// --------------------------------
	// Setup the application.
	// RETURNS: [boolean] `true` on success else `false` on fail.
	async setup() {
		await super.setup();	// call parent setup method
		return true;
	}

	// Launch the application
	// RETURNS: [boolean] `true` on success else `false` on fail.
	async launch() {
		// call parent launch method
		const ok = await super.launch();
		if ( !ok ) return false; // failed\
		return true; // succcess
	}

	// Build the gameboard, user, components, etc.
	// RETURNS: [boolean] `true` on success else `false` on fail.
	async build() {
		// --------------------------------
		// Emit Initial Event(s)
		// --------------------------------
		this.emit( 'prebuild', null ); // emit a pre-build hook event

		// --------------------------------
		// Add Special HTML Class(es)
		// --------------------------------
		this.windows[0].refs.viewport.addClass( 'jest-viewport-creator' );

		// --------------------------------
		// Call Pre-Build Method (if exists)
		// --------------------------------
		try { await this.preset(); }
		catch ( err ) {
			console.error( `Pre-build failed: ${err}` );
			throw err;
		}

		// --------------------------------
		// Call Super
		// --------------------------------
		await super.build();
		// change mode async build() {
		/*try { await super.build(); }
		catch ( err ) {
			console.error( `Build failed in parent super.build() method: ${err}` );
			throw err;
		}*/

		// --------------------------------
		// Set & Get Quick-Refs
		// --------------------------------
		// Get loading-screen loadbar.
		const loadbar	= this.spline.getScreen('loading').loadbar;
		// Update progress bar to show a tool has loaded.
		loadbar.update( 1, 10 ); // step 1 (initialization)
		//this.windows[0].expand( 800, 300 ); // auto-resize the window

		// --------------------------------
		// Plugin Hook(s)
		// --------------------------------
		// Initialize method plugin(s).
		await JestCreator.initPlugins( 'methods', this );
		loadbar.update(); // step 2

		// --------------------------------
		// Create Governor State(s)
		// --------------------------------
		// Instantiate some governor states.
		this.governor.init( 'clipboard', 1 ); // clipboard has 1 history state

		// --------------------------------
		// Create Application Interface [object]
		// --------------------------------
		// Build the panels for the main application screen.
		this.panel.addElements([
			// Build the panel
			{
				name:		'system',
				id:			'jest-creator-system',
				classes:	[ 'jest-creator-system' ]
			},
			{
				name:		'interface',
				id:			'jest-creator-interface',
				classes:	[ 'jest-creator-interface' ]
			},
			{
				name:		'status',
				id:			'jest-creator-status',
				classes:	[ 'jest-creator-status' ]
			}]);
		this.panel.refs.interface.addElements([
			// Build the panel
			{
				name:		'dock',
				id:			'jest-creator-interface-dock',
				classes:	[ 'jest-creator-interface-dock' ]
			},
			{
				name:		'left',
				id:			'jest-creator-interface-left',
				classes:	[ 'jest-creator-interface-left' ]
			},
			{
				name:		'center',
				id:			'jest-creator-interface-center',
				classes:	[ 'jest-creator-interface-center' ]
			},
			{
				name:		'right',
				id:			'jest-creator-interface-right',
				classes:	[ 'jest-creator-interface-right' ]
			}]);
		loadbar.update(); // step 3

		// --------------------------------
		// Setup Gameboard [object]
		// --------------------------------
		this.gameboard.display.addCanvas( 'workspace' ); // create gameboard canvas
		const canvas		= this.gameboard.display.getCanvas( 'workspace' );
		canvas.resize( 0, 0 );			// set default board width & height

		// --------------------------------
		// Animation Handler [object]
		// --------------------------------
		// Assign the gameboard canvas to the animator for animation rendering
		this.animator.canvas = canvas;	// Animator canvas is the world "screen"

		// --------------------------------
		// Create File Menu [object]
		// --------------------------------
		// Create the file menu.
		const filemenu		= new JestFileMenu( this );
		this.filemenu		= filemenu;	// store ref
		filemenu.build();				// build menu DOM
		// Create a brand logo inside the system bar.
		//filemenu.setTitle( this.name );
		filemenu.panel.createPanel({
			name       : 'jestLogo',
			tag        : 'img',
			attributes : { src: `${this.config.root}/images/jest_logo_red.png` },
			classes    : [ 'jest-logo' ]
			});
		// Define list of file menu action buttons.
		const fmActions		= [
			{ name: 'new', 	    text: 'New' },
			{ name: 'open',     text: 'Open' },
			{ name: 'save',     text: 'Save' },
			{ name: 'save_as',  text: 'Save As' },
			//{ name: 'sync',     text: 'Sync' },
			{ name: 'close',    text: 'Close' }
			];
		// Iterate list of buttons & generate button.
		fmActions.forEach(
			action => {
				const button	= filemenu.createButton( action )
			});

		//-----------------------------
		// File Menu Icon(s)
		//-----------------------------
		// Use buttons panel to add SVG icons to various button(s).
		const fmBtns		= filemenu.buttons; // get file menu buttons DOM
		// New tool tip:
		fmBtns.new.clicker.addAttribute( 'data-tooltip-keys', 'Ctrl + N' );
		// Open tool tip:
		fmBtns.open.clicker.addAttribute( 'data-tooltip-keys', 'Ctrl + O' );
		// Save tool tip:
		fmBtns.save.clicker.addAttribute( 'data-tooltip-keys', 'Ctrl + S' );
		// Saveas tool tip:
		fmBtns.save_as.clicker.addAttribute( 'data-tooltip-keys', 'Ctrl + Shift + S' );
		// Sync tool tip:
		//fmBtns.sync.clicker.addAttribute( 'data-tooltip', 'Save file to cloud.' );
		// Close tool tip:
		fmBtns.close.clicker.addAttribute( 'data-tooltip-keys', 'Ctrl + W' );
		// Trigger next update.
		loadbar.update(); // step 4

		// --------------------------------
		// Create Input File Select [object]
		// --------------------------------
		// Add file open file-select input [object] to filemenu.
		const fileSelect	= new JestInputFileSelect( this, this.filetypes );
		this.fileSelect		= fileSelect;
		fileSelect.build( 'fileSelect', ['open-file-select'] );
		// Add hidden file-select input panel to filemenu.
		filemenu.panel.addPanel( 'fileSelect', fileSelect.panel );
		// Add file-menu to client interface.
		this.panel.refs.system.addPanel( 'filemenu', filemenu.panel );
		filemenu.register( 'btnClick', 'fileMenu',
			( e, action, button ) => {
				// Call the file menu action method.
				this.fileMenuAction( action.name );
			});
		fileSelect.register(
			'select', 'openFile',
			fileInfo => {
				// Suspend the app & attempt to open the file.
				this.suspend( 'openFile' ); // suspend app
				this.openFile( fileInfo );
			});

		// --------------------------------
		// Create Easels for File View(s)
		// --------------------------------
		// Create easel(s) list for file view(s).
		this.easels			= {}; // [object] of easels
		// Create an easel for viewing & editing files.
		this.easels.files	= new JestEasel( this );

		// --------------------------------
		// Create Toolbar [object]
		// --------------------------------
		// Create the toolbar.
		const toolbar		= new JestToolbar( this );
		this.toolbar		= toolbar; // set toolbar
		toolbar.build();
		// Add toolbar to client interface.
		this.panel.refs.interface.refs.left.addPanel( 'toolbar', toolbar.panel );
		// Add event listener callback(s).
		toolbar.register(
			'btnClick', 'toolSwitch',
			( e, action, button ) => {
				// Switch tools.
				this.toolbox.setTool( action.name );
			});
		loadbar.update(); // step 5

		// --------------------------------
		// Plugin Creator UI Hook(s)
		// --------------------------------
		// Initialize user interface plugin(s).
		await JestCreator.initPlugins( 'ui', this );

		// --------------------------------
		// Plugin Online Hook(s)
		// --------------------------------
		// Initialize online plugin(s).
		await JestCreator.initPlugins( 'online', this );

		// --------------------------------
		// Plugin Settings Hook(s)
		// --------------------------------
		// Initialize settings plugin(s).
		await JestCreator.initPlugins( 'settings', this );
		loadbar.update(); // step 6

		//--------------------------------
		// History Menu Setup
		//--------------------------------
		// Create history (undo/redo) sidebar menu.
		this.sidebar.addDisableExclusion( 'history' ); // prevent forced collapse
		const histSection	= this.sidebar.addSection( 'history', 'History', null, {}, null );
		/*histSection.panel.createPanel({
			name       : 'count',
			tag        : 'div',
			text       : '15 states',
			classes    : ['jest-sidebar-section-header-info']
			});*/

		// --------------------------------
		// Create Toolbox
		// --------------------------------
		const toolbox	= new JestToolbox( this ); // create toolbox
		this.toolbox	= toolbox; // keep reference
		// Register toolbox unequip tool event.
		toolbox.register(
			'unequip', 'appToolsDisable',
			( name ) => {
				// Disable all side panels.
				this.sidebar.disableAllSections();
				// Reset button display.
				this.toolbar.deactivateButtons(); // deactivate all buttons
			});
		// Register toolbox equip tool event.
		toolbox.register(
			'equip', 'appToolSwitch',
			( name ) => {
				// Block action if app is busy.
				if ( this.busy() ) return; // app busy‐gate
				this.emit( 'equip', null, name ); // emit hook
			});

		//--------------------------------
		// Call the Configuration App-Plug
		//--------------------------------
		await this.configure();

		// --------------------------------
		// Add Ticker Event(s)
		// --------------------------------
		// Register the core animation loop using a timer.
		this.timers['ani'].register(
			'tick', 'render',
				e => {
					// Update the interactivity of the program.
					this.update( e );
					// Update the visual gameboard drawing.
					this.draw( e );
				} );
		// Create upper right filemenu bar panel.
		const topright	= new JestDisplay( this );
		topright.build( 'topright', ['jest-filemenu-topright'] );
		this.panel.refs.system.addPanel( 'topright', topright.panel );

		// --------------------------------
		// User Login/Sign-up Authentication
		// --------------------------------
		// Build the GUI.
		this.login.buildBadge(); // setup login/logout badge
		// Wire global login/logout events
		this.login.register(
			'login', 'setUser',
			( user ) => {
				// --------------------------------
				// Send User "Logged In" Notification
				// --------------------------------
				// Send user a simple notification.
				this.noticer.notify({
					text      : `Successfully logged in as ${user.username}!`,
					icon      : `${this.config.root}/images/icons/sm_profile.png`,
					duration  : 4000,
					//persistent: true,
					buttons   :
						[
						{ label: 'Ok', click: () => console.log('Ok pressed') }
						]
					//onExpire  : () => console.log('Notification expired')
					});
				// Play "login" sound effect to signal action.
				this.soundboard.playSound( 'jest_login', 'mp3', 1.05 );
			});
		//this.login.register( 'logout', 'tiler', () => this.clearUserUI() );
		// Check if user is logged in.
		await this.login.check();		// immediately check for existing session
		if ( this.login.logged!==true )
			this.login.show( "login" );	// show the login screen
		loadbar.update();				// step 10

		// --------------------------------
		// Successfully Exit Build
		// --------------------------------
		// Reveal the application screen.
		this.spline.goToScreen( 'application' );
		// App built, set built status
		this.gearshift( 'built' );		// app build
		this.emit( 'build', null );		// emit a build hook event
		this.emit( 'postbuild', null );	// emit a post-build hook event

		console.log('TEST: plugin types attached per class');
		console.log('OSConfigurable.plugins:', Object.keys(OSConfigurable.plugins));
		console.log('JestTiler.plugins:', Object.keys(JestTiler.plugins));
		console.log('JestAnimator.plugins:', Object.keys(JestAnimator.plugins));
		console.log('OSConfigurable.plugins === JestTiler.plugins:', OSConfigurable.plugins === JestTiler.plugins);
		console.log('JestTiler.plugins === JestAnimator.plugins:', JestTiler.plugins === JestAnimator.plugins);

		return true;
	}

	// Manage the state.
	// RETURNS: [void].
	// e	- Ticker event [object] data about frame.
	update( e ) { }

	// --------------------------------
	// Rendering Method(s)
	// --------------------------------
	// Draw the central gameboard.
	// RETURNS: [void].
	// e	- Ticker event [object] data about frame.
	draw( e ) { }

	// Open a file, generic placeholder (should be overrode).
	// RETURNS: [boolean] `true` on success else `false` on fail.
	// * fileInfo	- File information [object].
	async openFile( fileInfo ) { }
}
// Make JestCreator globally accessible for plugins
window.JestCreator = JestCreator;
