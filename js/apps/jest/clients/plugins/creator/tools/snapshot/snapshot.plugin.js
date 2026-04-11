//-------------------------------------------------------
// JEST ® All Rights Reserved
// Antago (God of Gravity), author of Graal2001 & Destiny
// Copyright ® 1999-2026
//-------------------------------------------------------
console.log( 'jestAlert: js/apps/jest/clients/plugins/creator/tools/snapshot/snapshot.plugin.js loaded' );

(function( window ) {
	var type    = 'tools';
	var subtype = 'snapshot';
	var plugin  = {
		//--------------------------------
		// Initialize Snapshot Tool
		//--------------------------------
		init: function( client ) {
			// Add "Snapshot" button to toolbar
			const button = client.toolbar.createButton( { name: subtype, text: null /*'Snapshot'*/ } );
			button.clicker.addAttribute( 'data-tooltip', 'Snapshot' );
			button.clicker.addAttribute( 'data-tooltip-keys', 'S' );
			// Define keyboard shortcut.
			client.io.registerShortcut( 'S', subtype );
			// Keyboard shortcut menu action.
			client.io.register( 'keyboardShortcut', 'snapshotCommand',
				command => {
					// Block input shortcuts while user is typing
					if ( client.io.isTypingInInput() ) return;
					// Affirm shortcut command is for "draw" tool.
					if ( command===subtype )
						client.toolbox.setTool( subtype );
				});

			button.clicker.addElements([
				//-----------------------------
				// Icon Aperture / Snapshot
				//-----------------------------
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
					classes    : [ 'ico-aperture' ],
					elements   :
						[
							{
								name       : 'path',
								tag        : 'path',
								attributes : {'d': 'M901.12,179.16l-248.02,180.1,456.52,331.64c17.3-96.33,6.84-195.52-30.05-286.13-36.94-90.61-98.81-168.84-178.45-225.66v.05ZM363.6,492.66l480.37-349.26c-90.8-48.61-194.02-68.95-296.48-58.45s-199.4,51.33-278.48,117.33l94.59,290.38ZM633.88,1116.61l79.5-244.64-553.78.05c94.31,152.68,260.95,245.63,440.39,245.72,11.39,0,22.73-.47,33.89-1.12h0ZM869.48,593.77l-166.87,513.74c90.52-18.47,174.42-60.7,243.14-122.44,68.72-61.69,119.72-140.58,147.74-228.56l-224.01-162.74ZM399.98,809.49L218.76,249.99c-68.2,74.16-113.3,166.6-129.66,266.02-16.36,99.38-3.33,201.42,37.5,293.48h273.38Z'}
							}
						]
				}]);
			//client.toolbox.tools.snapshot	= null;

			//--------------------------------
			// Event Registration & Handling
			//--------------------------------
			// Register snapshot action
			client.toolbox.register(
				'preequip', 'getSnapshot',
				( name ) => {
					// Check if user is taking a level snapshot.
					if ( name===subtype ) {
						//--------------------------------
						// Get Current Level View
						//--------------------------------
						// Check for open view & tool.
						const state		= this.getState();	// get program state
						if ( !state.levelView ) return;		// no level to snapshot
						const view		= state.levelView;
						const key		= state.levelViewKey;
						const name		= view.file.stem;
						//--------------------------------
						// Continue to Snapshot Level
						//--------------------------------
						// Get level canvas element
						const canvasWrapper = client.gameboard.display.getCanvas( 'workspace' );
						const htmlCanvas    = canvasWrapper.el;    // HTMLCanvasElement
						// Create PNG data URL
						const dataUrl       = htmlCanvas.toDataURL( 'image/png' );
						// Trigger download
						const link          = document.createElement( 'a' );
						link.href           = dataUrl;
						link.download       = `${name}.png`;
						document.body.appendChild( link );
						link.click();
						document.body.removeChild( link );
					}
				}
			);
		}
	};

	// Register with JestTiler
	if ( window.JestTiler && typeof window.JestTiler.use==='function' )
		window.JestTiler.use( type, plugin );
	else
		console.error( 'snapshot/snapshot.plugin.js load error: JestTiler.use() not found' );
})( window );
