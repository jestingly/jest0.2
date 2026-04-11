//-------------------------------------------------------
// JEST ® All Rights Reserved
// Antago (God of Gravity), author of Graal2001 & Destiny
// Copyright ® 1999-2026
//-------------------------------------------------------
console.log( 'jestAlert: js/apps/jest/components/message/JestNotice.js loaded' );

//-------------------------
// JestNotice Class
//-------------------------
// One notification panel object managed by JestNoticer.
class JestNotice extends JestElement {
	// Object property(ies)
	id				= '';
	noticer			= null;		// [JestNoticer] Parent JestNoticer reference.
	options			= {};		// [object] Original options object.

	//--------------------------------
	// Constructor
	//--------------------------------
	// Construct the notification panel.
	// * client		- [object] Application client that this piece belongs to.
	// * noticer	- [JestNoticer] Parent noticer.
	// * options	- [object] Notification options (text, buttons, icon, etc.).
	constructor( client, noticer, options ) {
		super( client ); // call parent constructor
		// Store reference to noticer noticer.
		this.noticer	= noticer;
		this.options	= options;
		// Generate an id.
		this.id			= `notif_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
		// Build the notification [object].
		this.build();
		// If notification is not persistent, give it a timeout.
		if ( !options.persistent ) {
			setTimeout(
				() => {
					this.noticer.close( this.id );
					options.onExpire && options.onExpire();
				},
				options.duration || 5000 );
		}
	}

	// --------------------------------
	// Initialization
	// --------------------------------
	// Build the element [object].
	// RETURNS: [void].
	// * name		- unique [string] value of component name in the system.
	// * classes	- [array] of classes to add to panel element.
	build( name='notification', classes=[] ) {
		// Construct the parent panel.
		if ( classes===null ) classes = [];
		super.build( 'div', name, ['notification'].mergeUnique(classes) );
		// Access the notification noticer.
		const container	= this.noticer.panel;
		// Create the panel [object] for the notice.
		const panel		= container.createPanel({
			name		: this.id,
			id			: this.id,
			classes		: [ 'jest-notification' ]
			});
		this.panel		= panel;

		// If icon is supplied, add it.
		if ( this.options.icon ) {
			const img	= panel.createPanel({
				tag		: 'img',
				name	: 'icon',
				classes	: [ 'jest-notification-icon' ]
				});
			img.el.src	= this.options.icon;
		}
		// If text is supplied, add text.
		const txt		= panel.createPanel({
			tag		: 'span',
			name	: 'text',
			classes	: [ 'jest-notification-text' ]
			});
		txt.el.textContent = this.options.text;

		// Add buttons.
		if ( this.options.buttons?.length ) {
			// Create the button container.
			const btnContainer =
				panel.createPanel({
					name	: 'buttons',
					classes	: [ 'jest-notification-buttons' ]
					});
			// Iterate buttons and generate.
			this.options.buttons.forEach(
				( { label, click } ) => {
					// Create button.
					const btn =
						btnContainer.createPanel({
							tag		: 'button',
							name	: `btn_${label}`,
							classes	: [ 'jest-notification-button' ],
							text	: label
							});
					// Register click event to button.
					btn.register(
						'click', 'action',
						() => {
							click && click( { id: this.id, element: panel.el } );
							// Play sound-effect signal.
							this.client.soundboard.playSound( 'jest_close0', 'mp3', 1.05 );
							this.noticer.close( this.id );
						}, 'dom' );
				});
		}

		// Animate in
		setTimeout( ()=>panel.addClass('jest-notif-show'), 10 );
		// Enable drag-to-dismiss
		this._enableDrag();
	}

	//--------------------------------
	// Close Panel
	//--------------------------------
	// Close and remove this notification panel.
	close() {
		// Remove class.
		this.panel.removeClass( 'jest-notif-fade-out' );
		// Set timer to destroy the panel.
		setTimeout( ()=>this.panel.destroy(), 300 );
	}

	//--------------------------------
	// Animate Bounce Down
	//--------------------------------
	// Animate this panel with bounce down effect.
	animateBounceDown() {
		// Add bounce class(es).
		this.panel.addClass( 'jest-notif-bounce-down' );
		// Register an animation end DOM event.
		this.panel.register(
			'animationend', 'removeNotice',
			() => this.panel.el.classList.remove( 'jest-notif-bounce-down' ),
			'dom', null, { once: true } );
	}

	//--------------------------------
	// Enable Drag-to-Dismiss
	//--------------------------------
	// Enable drag-to-dismiss interaction on this panel.
	_enableDrag() {
		let startX		= 0;
		let currentX	= 0;
		let dragging	= false;
		const threshold	= 0.5;
		// Create mouse down dragstart event.
		this.panel.register(
			'mousedown', 'dragstart',
			( e ) => {
				startX		= e.clientX;
				dragging	= true;
				this.panel.el.classList.add( 'jest-notif-slide-dragging' );
			}, 'dom' );
		// Create mouse drag listener (dragging notice off screen).
		this.panel.register(
			'mousemove', 'drag',
			( e ) => {
				if ( !dragging ) return;
				currentX = e.clientX - startX;
				this.panel.el.style.translate = `${currentX}px`;
			}, 'window' );
		// Release mouse drag listener.
		this.panel.register(
			'mouseup', 'drag',
			() => {
				// If not dragging, event is unrelated.
				if ( !dragging ) return; // escape
				// Set dragging to false (mouse released).
				dragging	= false; // no longer dragging
				// Remove CSS classes.
				this.panel.el.classList.remove( 'jest-notif-slide-dragging' );
				this.panel.el.style.removeProperty( 'translate' ); // clear translate style
				// Check if dragging past the threshold.
				if ( Math.abs(currentX)>(this.panel.el.offsetWidth*threshold) ) {
					// Slide out
					const classes = ( currentX>0 ) ?
						'jest-notif-slide-out-right' : 'jest-notif-slide-out-left';
					this.panel.addClass( classes );
					this.noticer.close( this.id ); // close notice
				}
				else {
					this.panel.addClass( 'jest-notif-slide-reset' );
					this.panel.register(
						'transitionend', 'notice',
						() => this.panel.removeClass( 'jest-notif-slide-reset' ),
						'dom', null, { once: true }
						);
				}
			}, 'window' );
	}
}
