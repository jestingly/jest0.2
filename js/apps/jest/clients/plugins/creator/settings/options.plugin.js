//-------------------------------------------------------
// JEST ® All Rights Reserved
// Antago (God of Gravity), author of Graal2001 & Destiny
// Copyright ® 1999-2026
//-------------------------------------------------------
console.log( 'jestAlert: js/apps/jest/clients/plugins/creator/settings/options.plugin.js loaded' );

//-------------------------
// Options Plugin
//-------------------------
// Add options for handling audio, history, etc.
(function( window ) {
	//--------------------------------
	// Plugin Metadata
	//--------------------------------
	const type		= 'settings';
	const subtype	= 'options';

	//--------------------------------
	// Plugin Definition
	//--------------------------------
	const plugin = {
		//--------------------------------
		// Initialize Plugin
		//--------------------------------
		// Called once when plugin is registered.
		// * client - [object] reference to JestCreator
		init: function( client ) {
			//-------------------------
			// Create Control Panel
			//-------------------------
			// Generate a "form" inside the sidebar.
			const optsPanel		= new JestForm( client );		// create DOM Panel element [object].
			optsPanel.build( 'options', ['tiler-options'] );	// build the form

			// Create the "SFX" mute option (as a checkbox).
			const inputMute	= new JestInputCheckbox( client, 'mute', null, false, 'Mute' );
			inputMute.build( `input-mute` );					// build field
			optsPanel.addField( 'mute', inputMute );			// add field to form
			inputMute.showLabel(); // show the label

			// Create volume input slider (0=mute, 100=full)
			const inputVolume = new JestInputRange( client, 'volume', null, 1, 'Volume' );
			inputVolume.setMin( 0 );
			inputVolume.setMax( 100 );
			inputVolume.setStep( 1 );
			inputVolume.build( 'input-volume' );
			optsPanel.addField( 'volume', inputVolume );
			inputVolume.showLabel();

			// Create history limit input slider.
			const inputHistory = new JestInputRange( client, 'history', null, 1, 'History' );
			inputHistory.setMin( 15 );
			inputHistory.setMax( 30 );
			inputHistory.setStep( 1 );
			inputHistory.build( 'input-history' );
			optsPanel.addField( 'history', inputHistory );
			inputHistory.showLabel();

			// Add the curator panel to the sidebar.
			client.sidebar.addDisableExclusion( 'options' ); // prevent forced collapse
			client.sidebar.addSection( subtype, 'Options', optsPanel.panel, {}, optsPanel );
			client.sidebar.refit( subtype ); // resize to fit contents

			//-------------------------
			// Handle Event(s)
			//-------------------------
			// Register an event when "sounds" are toggled.
			inputMute.register(
				'change', 'toggleSound',
				( enable ) => {
					// Turn on/off all sounds.
					client.soundboard.mute		= enable; // toggle sound
					//client.jot( 'optsSounds', enable );
				});
			let toggle		= false; // sounds off by default
			inputMute.setChecked( toggle );

			// Register an event when "sound" volume is modified.
			inputVolume.register(
				'change', 'scaleSound',
				( value ) => {
					// Scale sound volume by slider input.
					client.soundboard.volume	= value; // adjust volume
				});
			inputVolume.setValue( 10 );

			// Register an event when "history limit" modified.
			inputHistory.register(
				'change', 'changeHistoryLimit',
				( value ) => {
					// Match history limit to the slider input.
					client.settings.history = value; // adjust history limit
					// Iterate all open level views & set history limit.
					for ( const key in client.easels.files.views ) {
						const view = client.easels.files.views[key];
						// Change the history edit limit of each level.
						view.governor.setLimit( 'edit', value );
					}
				});
			inputHistory.setValue( 15 );
		},

		//--------------------------------
		// New Method(s) In Creator Application
		//--------------------------------
		extend: function( Klass, proto ) { }
	};

	//--------------------------------
	// Register With Creator Application
	//--------------------------------
	if ( window.JestCreator && typeof window.JestCreator.use==='function' )
		window.JestCreator.use( type, plugin );
	else console.error( 'options.plugin.js load error: JestCreator.use() not found' );
})( window );
