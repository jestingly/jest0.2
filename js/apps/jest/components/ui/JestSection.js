console.log( 'jestAlert: js/apps/jest/components/ui/JestSection.js loaded' );

//-----------------------------
// JestSection Class
//-----------------------------
// Collapsible sidebar section wrapper used by JestCollapsibleMenu.
class JestSection extends JestDisplay {
	// Object Properties
	id			= '';				// [string] Section unique id
	title		= '';				// [string] Text label for section
	icon		= null;				// [string|HTMLElement] Icon element or src path
	wrap		= null;				// [Panel] Inner content wrap for items
	contents	= null;				// [any] Optional data model reference
	_wasOpen	= false;			// [bool] Internal memory about collapsed state.

	//--------------------------------
	// Constructor
	//--------------------------------
	// Construct the [object].
	// * client	- [object] App client
	// * id		- [string] Unique section ID
	// * title	- [string] Section title
	// * icon	- [string|HTMLElement] optional icon
	constructor( client, id, title, icon=null ) {
		super( client );		// call parent constructor
		// Set section properties.
		this.id		= id;		// set section id
		this.title	= title;	// set section title text value
		this.icon	= icon;		// set section icon
	}

	//--------------------------------
	// Build Section
	//--------------------------------
	// Builds the full section panel UI.
	// RETURNS: [void].
	// * opts	- [object] optional { classes }
	build( opts={} ) {
		// Create container panel.
		const classes	= opts.classes?.section || [];
		super.build( `section-${this.id}`, ['sidebar-section'].mergeUnique(classes) );

		//--------------------------------
		// Begin Building Panel Element(s)
		//--------------------------------
		// Add section header and content wrapper.
		this.panel.addElements([
			{
				name    : 'title', tag: 'div',
				classes : ['sidebar-title'].mergeUnique( opts.classes?.title || [] )
			},
			{
				name    : 'content',
				tag     : 'div',
				classes : ['sidebar-content'].mergeUnique( opts.classes?.panel || [] )
			}]);

		// Add title span & optional icon/arrow.
		this.panel.refs.title.addElements([
			{
				name        : 'title',
				tag         : 'span',
				text        : this.title,
				classes     : [ 'title' ]
			},
			{
				name        : 'arrow',
				tag         : 'svg',
				attributes  :
					{
					xmlns   : "http://www.w3.org/2000/svg",
					viewBox : "0 0 24 24",
					width   : "24",
					height  : "24", "aria-hidden": "true"
					},
				classes     : [ 'ico-arrow' ],
				elements    :
					[{
						tag        : 'polyline',
						attributes :
							{
							points            : "6 9 12 15 18 9",
							"stroke-linecap"  : "round",
							"stroke-linejoin" : "round"
							}
					}]
			}]);

		// Add optional icon (image or element)
		if ( typeof this.icon==='string' ) {
			this.panel.refs.title.addElements([{
				name    : 'icon',
				tag     : 'img',
				src     : this.icon,
				classes : [ 'sidebar-icon' ]
				}]);
		}
		else if ( this.icon instanceof Element )
			this.panel.refs.title.el.appendChild( this.icon );

		// Add wrapping div to hold content items
		this.panel.refs.content.addElements([{
			name    : 'wrap',
			tag     : 'div',
			classes : ['sidebar-content-wrap']
			}]);

		// Keep reference to wrap panel
		this.wrap = this.panel.refs.content.refs.wrap;

		// Collapse initially
		this.panel.addClass( 'is-closed' );
	}

	//--------------------------------
	// Add Named Item to Section
	//--------------------------------
	// Adds a child UI element with explicit name for future access.
	// * name	– [string] Unique key for retrieval/removal.
	// * item	– [HTMLElement|Panel|JestElement]
	addItem( name, item ) {
		// Validate argument(s).
		if ( typeof name!=='string' || !name.length )
			throw new Error(`addItem(name,item) requires a valid name`);

		// Handle by item data type.
		if ( item instanceof JestElement )
			this.wrap.addPanel( name, item.panel );
		else if ( item instanceof Panel )
			this.wrap.addPanel( name, item );
		else if ( item instanceof HTMLElement )
			this.wrap.el.appendChild( item );
		else if ( item?.el instanceof HTMLElement )
			this.wrap.el.appendChild( item.el );
		else throw new Error( `Unsupported item type in addItem(${name})` );
	}

	//--------------------------------
	// Remove Named Item from Section
	//--------------------------------
	// Remove an item using a [string] name.
	// RETURNS: [bool] true if item found and removed
	// * name	– [string] Item name used in addPanel()
	removeItem( name ) {
		// Check if the item exists.
		if ( this.wrap?.panels?.[name] ) {
			this.wrap.removePanel( name );
			return true; // removed
		}
		return false; // doesn't exist
	}

	//--------------------------------
	// Set Section Title
	//--------------------------------
	// Update title label.
	// * text	- [string]
	setTitle( text ) {
		// Set innter text of title DOM element.
		this.title = text; // keep ref of text
		if ( this.panel?.refs?.title?.refs?.title )
			this.panel.refs.title.refs.title.el.innerText = text;
	}

	//--------------------------------
	// Set Section Icon
	//--------------------------------
	// Change icon element or src.
	// * icon	- [string|HTMLElement]
	setIcon( icon ) {
		// Check if title element exists.
		this.icon = icon;	// keep ref
		const ref = this.panel?.refs?.title;
		if ( !ref ) return;	// no title dom element
		// Remove old icon if present.
		const old = ref.refs?.icon?.el;
		if ( old ) old.remove();
		// Add the new icon.
		if ( typeof icon==='string' )
			ref.addElements([
				{ name: 'icon', tag: 'img', src: icon, classes: [ 'sidebar-icon' ] }
				]);
		else if ( icon instanceof Element )
			ref.el.appendChild( icon );
	}
}
