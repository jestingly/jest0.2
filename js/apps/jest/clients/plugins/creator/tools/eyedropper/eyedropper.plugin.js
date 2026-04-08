console.log( 'jestAlert: js/apps/jest/clients/plugins/creator/tools/eyedropper/eyedropper.plugin.js loaded' );

//-------------------------
// Eyedropper Plugin
//-------------------------
// Adds a tile sampling tool that reads a tile from the level on click.
(function( window ) {
	//--------------------------------
	// Plugin Metadata
	//--------------------------------
	const type		= 'tools';
	const subtype	= 'eyedropper';

	//--------------------------------
	// Plugin Definition
	//--------------------------------
	const plugin = {
		//--------------------------------
		// Initialize Plugin
		//--------------------------------
		// Called once when plugin is registered.
		// * client - [object] reference to JestTiler
		init: function( client ) {
			//-------------------------
			// Create Tool
			//-------------------------
			const tool		= new JestToolEyedropper( client, subtype );
			client.toolbox.registerTool( subtype, tool );
			tool.build(); // build the eyedropper tool
			// Wire into the grid.\
			tool.anchor.graticulate( client.config.tileGrid );

			// Simultaneous tools allowed:
			tool.coopt( ['tiledrop','levelMarquee'] );

			// Set canvas as target
			const canvas	= client.gameboard.display.getCanvas( 'workspace' );
			tool.setTarget( canvas );

			// Register Alt/Option key to temporarily wield eyedropper.
			/*client.toolbox.registerHoldTrigger(
				'Alt', subtype,
				{
					validTools:
						[
						'pencil',
						'floodfill',
						'levelMarquee'
						]
				});*/

			//--------------------------------
			// Toolbar Button & Shortcut
			//--------------------------------
			const button	= client.toolbar.createButton( { name: subtype, text: null } );
			button.clicker.addAttribute( 'data-tooltip', 'Eyedropper' );
			button.clicker.addAttribute( 'data-tooltip-keys', 'I' );
			// Register toolbar button action.
			client.register(
				'equip', 'setEyedropper',
				( name ) => {
					// Block action if app is busy.
					if ( client.busy() ) return; // app busy‐gate
					// Check current button action.
					if ( name===subtype ) {
						client.toolbox.setTool( tool ); // enable new tool
						// Activate the menu button
						client.toolbar.buttons[name].activate(); // toggle button on
					}
				});

			//-----------------------------
			// Icon Eyedropper
			//-----------------------------
			button.clicker.addElements([
				{
					name       : 'icon',
					tag        : 'svg',
					attributes : {
						xmlns        : "http://www.w3.org/2000/svg",
						viewBox      : "0 0 1200 1200",
						width        : "24",
						height       : "24",
						"aria-hidden": "true"
						},
					classes    : [ 'ico-eyedropper' ],
					elements   :
						[
							{
								name       : 'path',
								tag        : 'path',
								attributes :
									{
										'd': 'm853.87 531.94-404.39 404.34c-3.7031 3.75-8.1094 6.6562-12.984 8.4844l-78.422 30.422c-7.9219 3.0938-15.516 7.0312-22.641 11.766l-77.156 51.469s-47.953 30.516-87.609-9.1406c-39.703-39.703-9.1406-87.609-9.1406-87.609l51.469-77.156c4.7344-7.125 8.7188-14.719 11.766-22.641l30.422-78.422c1.875-4.8281 4.7812-9.2344 8.4844-12.984l404.39-404.39-46.125-46.125 53.062-53.016 46.125 46.125 104.67-104.72c51.234-51.234 134.26-51.188 185.48 0l0.32812 0.375c51.234 51.188 51.234 134.21 0 185.44l-104.67 104.72 46.125 46.125-53.062 53.016zm-132.79-132.79-238.36 238.36 159.56-0.046875 158.58-158.58z',
										'fill-rule': 'evenodd'
									}
							}
						]
				}]);

			//-----------------------------
			// Icon Switch Arrows
			//-----------------------------
			// Create "swap" swatch arrow button.
			const swapSwatch	= new JestDisplay( this );
			swapSwatch.build( 'invert', ['invert','invert-btn'] ); // build display
			this.swatches['foreground'].panel.addPanel( 'swapSwatch', swapSwatch.panel );
			swapSwatch.panel.addAttribute( 'data-tooltip', 'Swap' );
			swapSwatch.panel.addAttribute( 'data-tooltip-keys', 'X' );
			// Create the "swap swatch" button.
			swapSwatch.panel.addElements([
				{
					name       : 'icon',
					tag        : 'svg',
					attributes : {
						xmlns        : "http://www.w3.org/2000/svg",
						viewBox      : "0 0 1200 1200",
						width        : "1200pt",
						height       : "1200pt",
						"aria-hidden": "true",
						version      : 1.1
						},
					classes    : [ 'ico-invert' ],
					elements   :
						[
							{
								name       : 'path',
								tag        : 'path',
								attributes : {'d': 'm850 1050c-13.262 0-25.98-5.2695-35.355-14.645s-14.645-22.094-14.645-35.355v-450c0-39.781-15.805-77.938-43.934-106.07s-66.285-43.934-106.07-43.934h-450c-17.863 0-34.371-9.5312-43.301-25-8.9336-15.469-8.9336-34.531 0-50 8.9297-15.469 25.438-25 43.301-25h450c66.281 0.078125 129.82 26.445 176.69 73.312s73.234 110.41 73.312 176.69v450c0 13.262-5.2695 25.98-14.645 35.355s-22.094 14.645-35.355 14.645z'}
							},
							{
								name       : 'path',
								tag        : 'path',
								attributes : {'d': 'm850 1050c-13.258-0.003906-25.977-5.2734-35.352-14.648l-150-150c-12.266-12.703-16.922-30.93-12.254-47.957 4.668-17.027 17.973-30.332 35-35 17.027-4.668 35.254-0.011719 47.957 12.254l114.65 114.65 114.65-114.65v-0.003906c12.703-12.266 30.93-16.922 47.957-12.254 17.027 4.668 30.332 17.973 35 35 4.668 17.027 0.011719 35.254-12.254 47.957l-150 150c-9.375 9.375-22.094 14.645-35.352 14.648z'}
							},
							{
								name       : 'path',
								tag        : 'path',
								attributes : {'d': 'm350 550c-13.258-0.003906-25.977-5.2734-35.352-14.648l-150-150c-9.3711-9.3789-14.637-22.094-14.637-35.352s5.2656-25.973 14.637-35.352l150-150c12.703-12.266 30.93-16.922 47.957-12.254 17.027 4.668 30.332 17.973 35 35 4.668 17.027 0.011719 35.254-12.254 47.957l-114.65 114.65 114.65 114.65c9.3711 9.3789 14.637 22.094 14.637 35.352 0 13.262-5.2656 25.977-14.641 35.352s-22.09 14.645-35.348 14.648z'}
							},
						]
				}]);

			// Register "swap swatch" button.
			swapSwatch.panel.register(
				'click', 'swapSwatch', ()=>client.swapSwatches(), 'dom' );

			//-----------------------------
			// Keyboard Handling
			//-----------------------------
			// Define keyboard shortcut.
			client.io.registerShortcut( 'I', subtype );
			// Keyboard shortcut menu action.
			client.io.register( 'keyboardShortcut', 'eyedropperCommand',
				command => {
					//--------------------------------
					// Require Eyedropper Availability
					//--------------------------------
					// Block input shortcuts while user is typing.
					if ( client.io.isTypingInInput() ) return;
					// Affirm shortcut command is for "draw" tool.
					if ( command===subtype )
						client.toolbox.setTool( subtype );
				});

			// Define keyboard shortcut.
			client.io.registerShortcut( 'X', 'swapSwatch' );
			// Keyboard shortcut menu action.
			client.io.register(
				'keyboardShortcut', 'eyedropperSwapSwatch',
				command => {
					//--------------------------------
					// Require Eyedropper Availability
					//--------------------------------
					// Skip if user is typing.
					if ( client.io.isTypingInInput() ) return;
					// Check if active tool is "eyedropper"
					//if ( !client.toolbox.tools.eyedropper.enabled() ) return;
					if ( !['swapSwatch'].includes(command) )
						return; // unrecognized command
					// Attempt to swap the swatches.
					client.swapSwatches(); // swap swatches
				});

			//--------------------------------
			// Tile Grab on Click
			//--------------------------------
			// Called when user clicks level & tool is active.
			tool.register(
				'sample', 'grabTileData',
				e => {
					//-------------------------
					// Gatekeep Action
					//-------------------------
					// Block action if app is busy.
					if ( client.busy() ) return; // app busy‐gate
					//-------------------------
					// Capture Coordinates
					//-------------------------
					// Obtain the mouse click position.
					const pos	= canvas.mousePos( e );
					// Use the units (e.g. tile units).
					const units	= tool.anchor.units;
					// Convert mousecick to tile x,y coordinates.
					const x		= Math.floor( pos.x / units );
					const y		= Math.floor( pos.y / units );
					//-------------------------
					// Determine Action & Sample
					//-------------------------
					// Proeed to grab tile swatch.
					const key	= !e.shiftKey ? 'foreground' : 'background';
					client.toolEyedropLevelTile( x, y, key );
				});
		},


		//--------------------------------
		// New Method(s) In Tiler Application
		//--------------------------------
		extend: function( Klass, proto ) {
			// Invert foreground and backgroun swatches.
			// RETURNS: [void].
			proto.swapSwatches = function() {
				// Get foreground & background tiles.
				const foreground = { ...this.swatches['foreground'].contents };
				const background = { ...this.swatches['background'].contents };
				// Swap the tiles.
				this.toolSetTileSwatch( { tx: background.tx, ty: background.ty }, 'foreground' );
				this.toolSetTileSwatch( { tx: foreground.tx, ty: foreground.ty }, 'background' );
				// Play swap sound effect.
				this.soundboard.playSound( 'jest_flip', 'wav', 1.1 );
			}

			// Attempts to perform a flood fill action.
			// RETURNS: [void].
			// * e	- [object] MouseEvent event listener data.
			proto.toolEyedropLevelTile = function( x, y, key ) {
				//--------------------------------
				// Validate State & Get Editor [objects]
				//--------------------------------
				// Check for open view & tool.
				const state		= this.getState(); // get program state
				if ( !state?.levelView ) return;
				// Require level view & level [object].
				const view		= state.levelView;
				const level		= view.file.context;
				const canvas	= this.gameboard.display.getCanvas( 'workspace' );
				const tool		= this.toolbox.tools.eyedropper;
				//--------------------------------
				// Access Tile Data @ Coordinate
				//--------------------------------
				// Get tile data @ click location.
				const tile		= level.getTile( x, y );
				// If tile sampled, proceed to set the background swatch.
				if ( tile ) {
					// Set background swatch.
					this.toolSetTileSwatch( { tx: tile.tx, ty: tile.ty }, key );
					// Play sound-effect to signal.
					this.soundboard.playSound( 'jest_eyedrop', 'wav', 1.3 );
					// Emit eyedropper sampled event.
					this.emit( 'tileSampled', null, { x, y, tile, key } );
				}
			}
		}
	};

	//--------------------------------
	// Register Plugin
	//--------------------------------
	if ( window.JestTiler && typeof window.JestTiler.use==='function' )
		window.JestTiler.use( type, plugin );
	else console.error( 'eyedropper.plugin.js load error: JestTiler.use() not found' );
})( window );
