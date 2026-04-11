//-------------------------------------------------------
// JEST ® All Rights Reserved
// Antago (God of Gravity), author of Graal2001 & Destiny
// Copyright ® 1999-2026
//-------------------------------------------------------
console.log( 'jestAlert: js/apps/jest/clients/plugins/creator/ui/interactor.plugin.js loaded' );

// Interactor handling plugin (collapsible menu).
(function( window ) {
	// Define the plugin [object]
	var type	= 'ui';
	var subtype	= 'interactor';
	var plugin	= {
		//--------------------------------
		// Plugin Setup Function
		//--------------------------------
		init: function( client ) {
			// --------------------------------
			// Create Interactor Toolbar [object]
			// --------------------------------
			// Create the interactor toolbar.
			const interactor	= new JestToolbar( client );
			client.interactor	= interactor; // set interactor
			interactor.build( 'interactor', ['interactor'] );
			// Add interactor toolbar to client interface.
			client.panel.refs.interface.refs.center.addPanel( 'interactor', interactor.panel );
			// Add event listener callback(s).
			interactor.register(
				'btnClick', 'interact',
				( e, action, button ) => {
					// Switch tools.
					//client.toolbox.setTool( action.name );
				});
		}
	};
	// register with JestCreator
	if ( window.JestCreator && typeof window.JestCreator.use==='function' )
		window.JestCreator.use( type, plugin );
	else console.error( 'ui/interactor.plugin.js load error: JestCreator.use() not found' );
})( window );
