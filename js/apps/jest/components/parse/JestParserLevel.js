//-------------------------------------------------------
// JEST ® All Rights Reserved
// Antago (God of Gravity), author of Graal2001 & Destiny
// Copyright ® 1999-2026
//-------------------------------------------------------
console.log( 'jestAlert: js/apps/jest/components/parse/JestParserLevel.js loaded' );

//-------------------------
// NWFileParser Class
//-------------------------
// Parses Graal game `.nw` map files.
class JestParserLevel extends JestGamepiece {
	// Static class properties
	// Keywords: [object] Set array of acceptable keyword(s).
	static keywords			= new Set( ['BOARD'] );
	static keywordParsers	= {};	// { keywordName : (ctx, lineArray, indexRef, resultObj) => newIndex }
	static keywordEncoders	= {};	// { keywordName : (ctx, dataObjArray) => stringLines[] }
	// Tileset scanline reading / handling definition(s)
	charset					= null;				// [string] Default tile decoding order.
	tileWrap				= 16;				// after 16 tiles, the indices wrap
	tileBlock				= null;				// how many tiles in the wrapping block
	tilesetWidth			= 2048;				// width of tileset in pixels
	tilesetHeight			= 512;				// height of tileset in pixels
	tilesetRows				= null;				// 128 tiles per row
	tilesetColumns			= null;				// 32 tiles per column
	totalTiles				= null;				// 4096 total tiles

	//-------------------------
	// Constructor
	//-------------------------
	// Initializes the parser.
	// RETURNS: [void] Nothing.
	// * client		- client [object] that this piece belongs to.
	// * options	- [object] Optional configuration parameters.
	//   tileOrder	- [string] Custom tile decoding order.
	constructor( client, options={} ) {
		super( client ); // call parent constructor
		// Accept custom tileOrder parse algorithm
		if ( options.tileOrder )
			this.charset	 = options.tileOrder;
		else {
			// Determine parse order
			this.charset	 = '';
			this.charset	+= 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
			this.charset	+= 'abcdefghijklmnopqrstuvwxyz';
			this.charset	+= '0123456789';
			this.charset	+= '+';
			this.charset	+= '/';
		}
		// Instantiate calculations
		const units = this.client.config.tileGrid; // get tile WxH
		this.tilesetColumns	= this.tilesetWidth / units;				// 128 tile columns
		this.tilesetRows	= this.tilesetHeight / units;				// 32 tile rows
		this.totalTiles		= this.tilesPerRow * this.tilesPerColumn;	// 4096 total tiles
		this.tileBlock		= this.tilesetRows * this.tileWrap;			// 512 tiles per block
	}

	// Setup the parser (use async).
	async setup() {
		// Initialize method plugin(s).
		await JestParserLevel.initPlugins( 'keyword', this );
	}

	//-------------------------
	// Static Plugin Method(s)
	//-------------------------
	// Register the level block keyword for decoding level blocks.
	static registerKeywordParser( keyword, parserFn ) {
		this.keywords.add( keyword );
		this.keywordParsers[keyword] = parserFn;
	}

	// Register the level block keyword for encoding level blocks.
	static registerKeywordEncoder( keyword, encoderFn ) {
		this.keywordEncoders[keyword] = encoderFn;
	}

	//-------------------------
	// Tile Encoding/Decoding
	//-------------------------
	// Encodes a tile (x, y) into a 2-character base-64 tile code.
	// RETURNS: [str] Encoded 2-character tile code.
	// * xTile	- [int] Value of tile x on tileset.
	// * yTile	- [int] Value of tile y on tileset.
	encodeTile( xTile, yTile ) {
		// Determine which block this tile belongs to
		const block		= Math.floor( xTile/this.tileWrap );	// 16-column block
		const localX	= xTile % this.tileWrap;				// X coordinate within the block
		// Compute the scan-line index within the block (row-major order)
		const offset	= (yTile*this.tileWrap) + localX;		// Tile's position in the block
		// Compute the final global index in scan-line format
		const index		= (block*this.tileBlock) + offset;		// Global tile index
		// Convert to base-64 encoding
		const char1		= this.charset[ Math.floor(index/64) ];
		const char2		= this.charset[ index%64 ];
		// Return the encoded 2-character tile code
		return char1 + char2;
	}

	// Decodes a 2-character tile code into a tile index.
	// RETURNS: [int] The decoded tile index.
	// * tileCode	- [string] 2-character tile code.
	decodeTile( code ) {
		// Decode the 12-bit number (0-4095)
		const index		= this.charset.indexOf(code[0]) * 64 + this.charset.indexOf(code[1]);
		// There are 512 tiles per block (16 columns x 32 rows)
		const block		= Math.floor( index/this.tileBlock );				// determine which block chunk the tile is in
		const offset	= index % this.tileBlock;							// remainder of blockwrap = index in new block
		// Within a block, tiles are laid out row-major (left-to-right, then next row)
		const xTile		= (offset%this.tileWrap) + (block*this.tileWrap);	// x increases across blocks
		const yTile		= Math.floor( offset/this.tileWrap );
		// Return tile data
		return { ts:0, tx: xTile, ty: yTile, c: code };
	}

	//-------------------------
	// Row Parsing
	//-------------------------
	// Parses a single board row's tile data.
	// RETURNS: [array<int>] Array of tile indices.
	// * dataString	- [string] Concatenated tile codes.
	// * width		- [int] Expected number of tiles in the row.
	parseBoardRow( dataString, width ) {
		// Ensure tile data is complete.
		const expectedLength = width * 2;
		if ( dataString.length<expectedLength ) {
			throw new Error( `Board row tile data too short. Expected ${expectedLength}, got ${dataString.length}` );
		}
		// Decode tile codes.
		const rowTiles = [];
		for ( let i=0; i<expectedLength; i+=2 ) {
			const tileCode = dataString.substr( i, 2 );
			try {
				const index	= this.decodeTile( tileCode );
				rowTiles.push( index );
				//rowTiles.push( this.tileIndexToXY(index) );
			} catch ( e ) {
				console.error( `Error decoding tile at index ${i/2}:`, e );
				rowTiles.push( -1 ); // Default to an invalid tile index.
			}
		}
		return rowTiles;
	}

	//-------------------------
	// NW File Parsing
	//-------------------------
	// Parses the provided `.nw` file content.
	// RETURNS: [boolean] `true` on success else `false` on fail.
	// * fileContent	- [string] The raw text content of the `.nw` file.
	parse( { data: fileContent } ) {
		//-------------------------
		// Begin Line Split + Return Result
		//-------------------------
		// Begin declarations
		const lines		= fileContent.split( /\r?\n/ ); // Normalize line breaks.
		let boardLineCount = 0;
		const result	= {
			version:	null,	// game version identifier
			board:		[],		// board tiles [array<array<int>>]
			};
		// Declare reusable counter variable
		let i = 0;

		//-------------------------
		// Validate File Signature
		//-------------------------
		while ( i<lines.length && lines[i].trim()==='' ) i++; // Skip blank lines
		if ( i>=lines.length || lines[i].trim()!=='GLEVNW01' ) {
			console.warn( `Invalid or missing file signature. Expected "GLEVNW01"` ); //, got "${lines[i] ? lines[i].trim() : '(empty)'}"` );
			return false; // Reject file immediately
		}
		result.version	= lines[i].trim();
		i++;

		//-------------------------
		// Parse Map Contents
		//-------------------------
		while ( i<lines.length ) {
			let line	= lines[i].trim();
			let decode; // declare temp vars
			if ( line==='' ) {
				i++;
				continue;
			}

			//-------------------------
			// BOARD Parsing
			//-------------------------
			if ( line.startsWith('BOARD') ) {
				const tokens = line.split(/\s+/);
				if ( tokens.length<6 ) {
					console.warn( `Invalid BOARD line: ${line}` );
					return false; // FAIL HARD
				}

				const rowIndex	= parseInt( tokens[2], 10 );
				const width		= parseInt( tokens[3], 10 );
				const tileData	= tokens.slice(5).join( '' );
				const grid		= this.client.config.levelGrid; // get tile WxH

				// Validate BOARD line content
				if ( width!==grid ) {
					console.warn( `Invalid BOARD width (expected ${grid}): got ${width}` );
					return false;
				}

				if ( tileData.length!==width*2 ) {
					console.warn( `BOARD row ${rowIndex}: Invalid tile data length (expected ${width*2}): ${tileData.length}` );
					return false;
				}

				// Validate that all characters are in charset
				for ( let j=0; j<tileData.length; j++ ) {
					const c = tileData[j];
					if ( !this.charset.includes( c ) ) {
						console.warn( `BOARD row ${rowIndex}: Invalid character '${c}' in tile data.` );
						return false;
					}
				}

				// Now parse as before
				try {
					const rowTiles = this.parseBoardRow( tileData, width );
					result.board[rowIndex] = rowTiles;
				} catch ( e ) {
					console.error( `Error parsing BOARD row ${rowIndex}:`, e );
					return false; // FAIL HARD
				}
				boardLineCount++;
				i++;
				continue;
			}

			//-------------------------
			// PLUGIN Block Parsing
			//-------------------------
			const keyword = line.split(/\s+/)[0];
			if ( this.constructor.keywords.has(keyword) ) {
				const fn = this.constructor.keywordParsers[keyword];
				if ( typeof fn==='function' ) {
					i = fn( this, lines, i, result ) ?? (i+1);
					continue;
				}
			}

			// Unrecognized lines are skipped.
			i++;
		} // end while loop

		//-------------------------
		// Validate Activity Summary
		//-------------------------
		// Validate data.
		if ( boardLineCount!==64 ) {
			console.warn( `Invalid BOARD block count (expected 64): ${boardLineCount}` );
			return false;
		}
		// Return result
		return result; // successfully parsed
	}

	//-------------------------
	// Board Row Encoding
	//-------------------------
	// Encodes a single row of tile objects into `.nw` tile data.
	// RETURNS: [string] Concatenated 2-character tile codes.
	// * rowTiles	- [array<object>] Array of tile objects { ts, tx, ty }.
	encodeBoardRow( rowTiles ) {
		// Validate input row length.
		const grid = this.client.config.levelGrid;
		if ( rowTiles.length!==grid )
			throw new Error( `encodeBoardRow: Invalid row length. Expected ${grid}, got ${rowTiles.length}` );
		// Begin tile encoding.
		let tileData = '';
		for ( let tile of rowTiles ) {
			// Validate tile object.
			if ( tile.ts!==0 ) {
				console.warn( `encodeBoardRow: Tile with ts=${tile.ts} detected, .nw format does not store tileset index.` );
				// You may choose to throw an error instead:
				// throw new Error( `encodeBoardRow: ts=${tile.ts} not supported.` );
			}
			// Encode tile coordinates.
			tileData += this.encodeTile( tile.tx, tile.ty );
		}
		// Return the row string.
		return tileData;
	}

	//-------------------------
	// NW File Encoding
	//-------------------------
	// Encodes the provided board + metadata to `.nw` file format.
	// RETURNS: [string] Fully formatted `.nw` file content.
	// * data	- [object] { board, links, signs, npcs, ...pluginData }
	encode( { board, ...rest } ) {
		let out = 'GLEVNW01\n';

		// -------------------------
		// Encode BOARD Rows
		// -------------------------
		const grid = this.client.config.levelGrid;
		for ( let rowIndex=0; rowIndex<board.length; rowIndex++ ) {
			const tileData = this.encodeBoardRow( board[rowIndex] );
			out += `BOARD 0 ${rowIndex} ${grid} 0 ${tileData}\n`;
		}

		// -------------------------
		// Encode Plugin Keyword Blocks
		// -------------------------
		for ( const keyword of this.constructor.keywords ) {
			// Skip BOARD – already written
			if ( keyword==='BOARD' ) continue;

			const encoderFn = this.constructor.keywordEncoders[keyword];
			const key	= keyword.toLowerCase();
			const data	= rest[key];

			if ( typeof encoderFn==='function' && data ) {
				const lines = encoderFn( this, data );
				for ( const line of lines )
					out += line + '\n';
			}
		}

		// Return encoded data.
		return out;
	}
}

// Make JestParserLevel globally accessible for plugins
window.JestParserLevel = JestParserLevel;
