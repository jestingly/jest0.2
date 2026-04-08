console.log( 'jestAlert: js/apps/jest/clients/plugins/creator/methods/editor.plugin.js loaded' );

// Level editor "methods" plugin.
(function( window ) {
	// Define the plugin [object]
	var type	= 'methods';
	var subtype	= 'editor';
	var plugin	= {
		//--------------------------------
		// Plugin Setup Function
		//--------------------------------
		init: function( client ) {
			// Appropriately label each history item.
			client.register(
				'history:logged', 'labelItem',
				( item, log ) => {
					// Check for history label.
					if ( log.history )
						return item.setLabel( log.history );
					// Switch log action & determine label.
					switch ( log.action ) {
						case 'fillTile': // use a fill tile
							item.setLabel( 'Tiles changed.' );
							break;
						case 'sparseRegion': // draw a series of tile(s)
							item.setLabel( 'Sparse region laid.' );
							break;
						case 'fillRegion': // drop a clone of the region
							level.dropRegion( x, y, replace );
							break;
						case 'dropRegion': // drop a clone of the region
							level.dropRegion( x, y, replace );
							break;
						//default: console.warn( `Revert Action Unknown: ` );
					}
				});
		},

		//--------------------------------
		// New Method(s) In Tiler Application
		//--------------------------------
		extend: function( Klass, proto ) {
			//--------------------------------
			// Level Editing Method(s)
			//--------------------------------
			// Replace a region in the level matrix with a tile.
			// RETURNS: [boolean] `true` on success else `false` on fail.
			// * x,y	- [number] Coordinates of location on level to fill.
			// * matrix	- 2D [array] Matrix to replace a region with.
			// stamp	- ElementCanvas [object] stamp (for faster render).
			proto.toolLevelReplaceRegion = function( x, y, matrix, stamp=null ) {
				// Validate an active view is open.
				if ( !this.tabbarFile.activeView ) return;		// disabled
				const view		= this.tabbarFile.activeView;	// get active level file
				const level		= view.file.context;			// active JestLevel instance
				const key		= view.skey;					// governor stack key
				//--------------------------------
				// Get Old & New Tile Data
				//--------------------------------
				// Build arrays for undo log
				const oldArr	= [];
				const newArr	= [];
				// Loop through matrix
				for ( let row=0; row<matrix.length; row++ ) {
					for ( let col=0; col<matrix[row].length; col++ ) {
						// Grab tile inside matrix.
						const tile	= matrix[row][col];
						if ( !tile ) continue; // skip empty
						// Determine level grid x,y.
						const lx	= x + col;
						const ly	= y + row;
						// Bounds check
						if ( !level.inBounds1D(lx) || !level.inBounds1D(ly) ) continue;
						// Clone existing tile
						const oldT	= level.cloneTile( lx, ly );
						// Apply tile
						level.fillRegion( lx, ly, 1, 1, tile );
						// Build undo entry
						oldArr.push( { x:lx, y:ly, ...oldT } );
						newArr.push( { x:lx, y:ly, ...tile } );
					}
				}
				//--------------------------------
				// Create Snapshot For Undo/Redo
				//--------------------------------
				// Log to governor.
				if ( oldArr.length ) {
					// Generate "sparseRegion" log.
					const log = {
						action : 'sparseRegion',
						old    : oldArr,
						neu    : newArr
						};
					view.governor.log( 'edit', log ); // log change in governor
				}
				return true; // success
			}

			//--------------------------------
			// File Undo/Redo Method(s)
			//--------------------------------
			// Take a # (positive or negative) and use it to undo or redo.
			// RETURNS: [void].
			// * count	- signed [int] value to iterate (negative for undo).
			proto.revertFile = function( count ) {
				// Validate an active view is open.
				if ( !this.tabbarFile.activeView ) return false; // disabled
				const view		= this.tabbarFile.activeView;	// get active level file viewer
				const level		= view.file.context;			// active JestLevel instance
				const key		= view.skey;					// governor stack key
				// Iterate requested amount of direction.
				const dir		= count<0 ? 'undo' : 'redo';	// determine direction
				for ( let i=0; i<Math.abs(count); i++ ) {
					if ( dir==='undo' ) // undo last action
						view.governor.undo( 'edit' ); // get undo data
					else if ( dir==='redo' ) // redo last action
						view.governor.redo( 'edit' ); // get redo data
				}
			}

			//--------------------------------
			// File Undo/Redo Method(s)
			//--------------------------------
			// Listen to undo an action inside an open level file's govenror
			// RETURNS: [void].
			// * dir		- [string] Value of whether "undo" or "redo".
			// * skey		- [string] Level editor view unique system key.
			// * snapshot	- [object] Data from undo/redo event.
			proto.fileReverted = function( dir, skey, snapshot ) {
				// Validate an active view is open.
				const easel		= this.easels?.files;		// get easel for finding view
				const view		= easel?.getView( skey );	// file viewer
				const file		= view?.file?.context;		// active JestLevel instance
				if ( !snapshot || !view || !file )
					return false; // can't access file view
				// Get altered dimensions & coordinates.
				let x, y, w, h, replace;
				if ( dir==='undo' ) // undo last action
					( { x, y, w, h, old: replace } = snapshot );
				else if ( dir==='redo' ) // redo last action
					( { x, y, w, h, neu: replace } = snapshot );
				//--------------------------------
				// Draw on the Level (updates tilemap + canvas)
				//--------------------------------
				// Check undo/redo action & perform appropriate action.
				//console.log( x, y, w, h, replace );
				switch ( snapshot.action ) {
					case 'fillTile': // use a fill tile
						file.fillRegion( x, y, w, h, replace );
						break;
					case 'sparseRegion': // draw a series of tile(s)
						file.applySparseRegion( replace );
						break;
					case 'fillRegion': // drop a clone of the region
						file.dropRegion( x, y, replace );
						break;
					case 'dropRegion': // drop a clone of the region
						file.dropRegion( x, y, replace );
						break;
					//default: console.warn( `Revert Action Unknown: ` );
				}
				// Emit an event.
				this.emit( 'revert', null, dir, snapshot );
			}

			//--------------------------------
			// Utility: center of visible gameboard
			//--------------------------------
			// RETURNS: { x, y } in *pixel* coordinates local to the canvas
			// * units	- [int] set grid dimension units
			proto.getVisibleLevelCenter = function( units=1 ) {
				// Get level canvas.
				const canvas	= this.gameboard.display.getCanvas('workspace').el;
				// If your canvas is inside a scrollable DIV, use that instead:
				const container	= canvas.parentElement;
				const visibleW	= container.clientWidth;
				const visibleH	= container.clientHeight;
				const scrollX	= container.scrollLeft;
				const scrollY	= container.scrollTop;
				const canvasW	= canvas.width;				// canvas width (in pixels)
				const canvasH	= canvas.height;			// canvas height (in pixels)
				// Begin center calculation(s).
				let centerX, centerY;
				// Horizontal center
				if ( visibleW>=canvasW ) {
					// container wider than canvas → full canvas visible
					centerX = canvasW / 2;
				}
				else {
					const halfVW	= visibleW / 2;
					const minMidX	= halfVW;
					const maxMidX	= canvasW - halfVW;
					const rawMidX	= scrollX + halfVW;
					centerX = Math.min( Math.max(rawMidX,minMidX), maxMidX );
				}
				// Vertical center
				if ( visibleH>=canvasH ) {
					centerY = canvasH / 2;
				}
				else {
					const halfVH	= visibleH / 2;
					const minMidY	= halfVH;
					const maxMidY	= canvasH - halfVH;
					const rawMidY	= scrollY + halfVH;
					centerY = Math.min( Math.max(rawMidY,minMidY), maxMidY );
				}
				// Confine centerX and centerY to units.
				centerX	= Math.floor( centerX / units );
				centerY	= Math.floor( centerY / units );
				return { x: centerX, y: centerY }; // return coordinates
			}

			// Fill a region in the level matrix with a tile.
			// RETURNS: [boolean] `true` on success else `false` on fail.
			// * x,y	- [number] Coordinates of location on level to fill.
			// * w,h	- [number] Width and height dimensions of region to fill.
			// tile		- [object] Tile data to flood fill into region.
			proto.toolLevelFillRegion = function( x, y, w, h, tile=null ) {
				// Validate an active view is open.
				if ( !this.tabbarFile.activeView ) return;		// disabled
				const view		= this.tabbarFile.activeView;	// get active level file
				const level		= view.file.context;			// active JestLevel instance
				const key		= view.skey;					// governor stack key
				//--------------------------------
				// Get Old & New Tile Data
				//--------------------------------
				// Build the “new” tile that we want to draw:
				const swatch	= this.swatches.background.contents;
				const newTile	= tile ?? { ts: swatch.ts, tx: swatch.tx, ty: swatch.ty };
				//--------------------------------
				// Deep-Clone Existing Region on Level Tilemap
				//--------------------------------
				// This gives us an h×w array of {ts,tx,ty} or null,
				// strictly separated from the live tilemap.
				const oldMatrix	= level.cloneRegion( x, y, w, h );
				//--------------------------------
				// Draw on the Level (updates tilemap + canvas)
				//--------------------------------
				level.fillRegion( x, y, w, h, newTile );
				//--------------------------------
				// Build a 2D [array] of `new` values to match `oldMatrix` shape
				//--------------------------------
				// Every cell in `newMatrix` is the same newTile object,
				// but we must clone it into individual {ts,tx,ty} so undo can restore it
				const newMatrix	= this.grapher.createMatrix( w, h, newTile );
				//--------------------------------
				// Create Snapshot For Undo/Redo
				//--------------------------------
				const log = {
					action:	"fillRegion",
					x:		x,
					y:		y,
					w:		w,
					h:		h,
					old:	oldMatrix,	// deep-cloned old region
					neu:	newMatrix	// deep-cloned “just placed” tiles
					};
				view.governor.log( 'edit', log );		// log change in governor
				return true; // success
			}

			// -------------------------
			// Fill Masked Marquee Tiles
			// -------------------------
			// Fill all active tiles in a composite selection using the background swatch.
			// RETURNS: [boolean] true on success.
			// * x,y		- [int] Values of mask top-left x,y coordinates on canvas.
			// * mask		- 2d [array<boolean>] of add/subtract rects to draw.
			proto.toolLevelFillMask = function( x, y, mask ) {
				// Validate active level view and selection data.
				if ( this.busy() ) return false;
				const view		= this.tabbarFile.activeView;
				const level		= view.file.context;
				const key		= view.skey;

				// Get tile grid units.
				const units		= this.config.tileGrid;

				// Get tile to draw
				const swatch	= this.swatches.background.contents;
				const newTile	= { ts: swatch.ts, tx: swatch.tx, ty: swatch.ty };

				// Build sparse undo arrays
				const oldArr	= [];
				const newArr	= [];

				// Iterate the mask & clear underneath.
				const h = mask.length, w = mask[0].length;
				for ( let my=0; my<h; my++ ) {
					for ( let mx=0; mx<w; mx++ ) {
						// Ensure coordinate is [boolean] true in mask.
						if ( !mask[my][mx] ) continue; // skip

						// Calculate real level destination x,y.
						const lx	= x + mx;
						const ly	= y + my;
						if ( !level.inBounds1D(lx) || !level.inBounds1D(ly) ) continue;

						// Clone old tile before overwrite
						const old	= level.cloneTile( lx, ly );
						oldArr.push( { x:lx, y:ly, ...old } );

						// Write new tile
						level.fillRegion( lx, ly, 1, 1, newTile );
						newArr.push( { x:lx, y:ly, ...newTile } );
					}
				}

				// Nothing to change?
				if ( oldArr.length===0 ) return false; // fail

				// Submit sparse undo log
				const log = {
					action : 'sparseRegion',
					old    : oldArr,
					neu    : newArr
					};
				// Log change inside the governor.
				view.governor.log( 'edit', log );
				return true; // success
			}
		}
	};
	// register with JestCreator
	if ( window.JestCreator && typeof window.JestCreator.use==='function' )
		window.JestCreator.use( type, plugin );
	else console.error( 'methods/editor.plugin.js load error: JestCreator.use() not found' );
})( window );
