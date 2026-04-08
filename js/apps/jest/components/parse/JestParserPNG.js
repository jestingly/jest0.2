console.log( 'jestAlert: js/apps/jest/components/parse/JestParserPNG.js loaded' );

//-------------------------
// JestParserPNG Class
//-------------------------
// Parser for binary PNG image structure.
// Parses a PNG file's chunks, headers, and metadata.
// Emits image info and optional chunks as result.
//-------------------------
class JestParserPNG extends JestGamepiece {
	//-------------------------
	// Instantiation
	//-------------------------
	// Construct the [object].
	// * client		- [object] Application client that this piece belongs to.
	constructor( client ) {
		super( client );
	}

	//-------------------------
	// PNG Parser
	//-------------------------
	// Parses a PNG binary into structured chunk info.
	// * name		- [string] filename or identifier.
	// * data		- [Uint8Array|ArrayBuffer|Blob] binary PNG data.
	// RETURNS: [object] parsed PNG structure.
	parse( { name, data } ) {
		//-------------------------
		// Validate & Normalize Input
		//-------------------------
		let bytes	= null;
		if ( data instanceof Blob ) {
			throw new Error( 'JestParserPNG.parse() requires pre-converted ArrayBuffer or Uint8Array. Do not pass Blob directly.' );
		}
		else if ( data instanceof ArrayBuffer ) {
			bytes	= new Uint8Array(data);
		}
		else if ( data instanceof Uint8Array ) {
			bytes	= data;
		}
		else throw new Error( 'JestParserPNG.parse() received invalid binary format for "data".' );

		//-------------------------
		// Validate PNG Signature
		//-------------------------
		const PNG_SIGNATURE = [ 137,80,78,71,13,10,26,10 ]; // 8 bytes
		for ( let i=0; i<8; i++ ) {
			if ( bytes[i]!==PNG_SIGNATURE[i] )
				throw new Error( `Invalid PNG signature at byte ${i}, got ${bytes[i]}` );
		}

		//-------------------------
		// Chunk Iteration Logic
		//-------------------------
		let pos			= 8; // start after PNG signature
		const chunks	= [];

		while ( pos<bytes.length ) {
			if ( (pos+8)>bytes.length ) break; // not enough for length + type
			const length	= this.readUInt32( bytes, pos );			// Length of data
			const type		= this.readAscii( bytes, pos+4, 4 );		// Chunk type (4 ASCII chars)
			const chunkData	= bytes.slice( pos+8, pos+8+length );
			const crc		= this.readUInt32( bytes, pos+8+length );	// CRC

			chunks.push( { type, length, crc, data: chunkData } );
			pos += 12 + length; // length + type + data + crc
		}

		//-------------------------
		// Return Parsed Info
		//-------------------------
		return {
			name,
			chunks,
			header:		chunks.find( c => c.type === 'IHDR' ),
			textChunks:	chunks.filter( c => c.type === 'tEXt' ),
			};
	}

	//-------------------------
	// Utility Methods
	//-------------------------
	// Reads a big-endian 32-bit unsigned integer from byte array at offset.
	readUInt32( bytes, offset ) {
		return ( bytes[offset]<<24) | (bytes[offset+1]<<16) | (bytes[offset+2]<<8 ) | bytes[offset+3];
	}

	// Reads a fixed-length ASCII string from byte array at offset.
	readAscii( bytes, offset, length ) {
		return String.fromCharCode.apply( null, bytes.slice(offset,offset+length) );
	}
}

//----------------------------------
// Export globally
//----------------------------------
window.JestParserPNG = JestParserPNG;
