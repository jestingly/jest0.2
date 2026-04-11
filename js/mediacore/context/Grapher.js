//-------------------------------------------------------
// JEST ® All Rights Reserved
// Antago (God of Gravity), author of Graal2001 & Destiny
// Copyright ® 1999-2026
//-------------------------------------------------------
console.log( 'jestAlert: js/mediacore/context/Grapher.js loaded' );

// Matrix class
class Grapher extends Anchor {
	//--------------------------------
	// getLinePoints( x0, y0, x1, y1 )
	//--------------------------------
	// Generates integer tile coordinates between two points
	// using Bresenham's Line Algorithm.
	// RETURNS: [array] of [x, y] points in draw order.
	// * x0, y0		- [int] start tile coordinate
	// * x1, y1		- [int] end tile coordinate
	getLinePoints( x0, y0, x1, y1 ) {
		//--------------------------------
		// Initialize Line Variables
		//--------------------------------
		const points	= [];						// [array] list of [x,y] points
		const dx		= Math.abs( x1 - x0 );		// [int] distance X
		const dy		= Math.abs( y1 - y0 );		// [int] distance Y
		const sx		= ( x0 < x1 ) ? 1 : -1;		// [int] step direction X
		const sy		= ( y0 < y1 ) ? 1 : -1;		// [int] step direction Y
		let err			= dx - dy;					// [int] error diff
		//--------------------------------
		// Generate Line Path
		//--------------------------------
		while ( true ) {
			points.push( [ x0, y0 ] );				// Add current point to list
			// Exit condition: reached destination
			if ( x0===x1 && y0===y1 ) break;
			// Calculate new error and step
			const e2 = 2 * err;
			// Step X if error allows
			if ( e2 > -dy )
				err -= dy, x0 += sx;
			// Step Y if error allows
			if ( e2 <  dx )
				err += dx, y0 += sy;
		}
		return points; // return points
	}

	//--------------------------------------------
	// Clone a 2D Array
	//--------------------------------------------
	// RETURNS: [array] new deep clone of a 2D array
	// * input2DArray - [array] 2D array to clone
	clone2DArray( input2DArray ) {
		// Use map to create a new array with each row cloned via slice
		return input2DArray.map( row => row.slice() );
	}

	//--------------------------------------------
	// Expand a 2D Array
	//--------------------------------------------
	// RETURNS: [array] new 2D array with expanded dimensions
	// * input2DArray  – [array] original 2D array to expand
	// * expandBy      – [int] number of layers to add on each side
	// * fillValue     – [any] optional value to fill new cells (default: null)
	expand2DArray( input2DArray, expandBy=1, fillValue=null ) {
		//--------------------------------
		// Validate arguments
		//--------------------------------
		if ( !Array.isArray(input2DArray) || !Array.isArray(input2DArray[0]) )
			throw new Error( 'expand2DArray: input must be a 2D array' );

		if ( typeof expandBy!=='number' || expandBy<0 )
			throw new Error( 'expand2DArray: expandBy must be a non-negative integer' );

		//--------------------------------
		// Get original dimensions
		//--------------------------------
		// Original dimensions NxM.
		const originalRows	= input2DArray.length;
		const originalCols	= input2DArray[0].length;
		// New dimensions NxM.
		const newRows = originalRows + 2 * expandBy;
		const newCols = originalCols + 2 * expandBy;

		//--------------------------------
		// Build expanded array
		//--------------------------------
		const expanded = [];
		for ( let y=0; y<newRows; y++ ) {
			const row = [];
			for ( let x=0; x<newCols; x++ ) {
				//--------------------------------
				// Check if inside original bounds
				//--------------------------------
				const originalY = y - expandBy;
				const originalX = x - expandBy;
				// Copy original value
				if ( originalY >= 0 && originalY < originalRows &&
					 originalX >= 0 && originalX < originalCols )
					row.push( input2DArray[originalY][originalX] );
				else row.push( fillValue ); // Use fill value
			}
			// Add new row.
			expanded.push( row );
		}
		// Return expanded matrix.
		return expanded;
	}

	//--------------------------------------------
	// Fill Matrix Perimeter with Repeating Items
	//--------------------------------------------
	// RETURNS: [array] new 2D matrix with perimeter replaced by looping items[]
	// * matrix		– [array] input 2D matrix (used for dimensions only)
	// * items		– [array] values to loop across the perimeter
	// * angle		– [int] starting direction in degrees (0 = left-middle, 90 = top-middle, etc.)
	fillMatrixPerimeter( matrix, items, angle=0 ) {
		//--------------------------------
		// Validate Inputs
		//--------------------------------
		if ( !Array.isArray(matrix) || !Array.isArray(matrix[0]) )
			throw new Error( 'fillMatrixPerimeter: matrix must be a 2D array' );

		if ( !Array.isArray(items) || items.length===0 )
			throw new Error( 'fillMatrixPerimeter: items must be a non-empty array' );

		//--------------------------------
		// Get matrix dimensions
		//--------------------------------
		// Get dimensions of columns & rows of NxM matrix.
		const rows	= matrix.length;
		const cols	= matrix[0].length;

		//--------------------------------
		// Build full perimeter index list (corners included once)
		//--------------------------------
		// Create perimeter [array].
		const perimeter = [];

		// Top row (left → right)
		for ( let x=0; x<cols; x++ )
			perimeter.push( [0, x] );

		// Right column (top+1 → bottom-1)
		for ( let y=1; y<rows-1; y++ )
			perimeter.push( [y, cols-1] );

		// Bottom row (right → left)
		for ( let x=cols-1; x>=0; x-- )
			perimeter.push( [rows-1, x] );

		// Left column (bottom-1 → top+1)
		for ( let y=rows-2; y>0; y-- )
			perimeter.push( [y, 0] );

		//--------------------------------
		// Determine Angle-Based Start Index
		//--------------------------------
		const startIndex = (() => {
			// Standard angles mapped to central edges.
			switch ( angle % 360 ) {
				case 0:		return perimeter.findIndex( ([y,x]) => y===Math.floor(rows/2) && x===0 );
				case 90:	return perimeter.findIndex( ([y,x]) => y===0 && x===Math.floor(cols/2) );
				case 180:	return perimeter.findIndex( ([y,x]) => y===Math.floor(rows/2) && x===cols-1 );
				case 270:	return perimeter.findIndex( ([y,x]) => y===rows-1 && x===Math.floor(cols/2) );
				default: {
					// Custom angle → use dot product projection to select closest edge point
					const rad	= ( angle % 360 ) * Math.PI / 180;
					const cx	= cols / 2;
					const cy	= rows / 2;
					const dx	= Math.cos( rad );
					const dy	= -Math.sin( rad );

					let maxDot	= -Infinity;
					let bestI	= 0;

					for ( let i=0; i<perimeter.length; i++ ) {
						const [y,x]	= perimeter[i];
						const px	= x - cx;
						const py	= y - cy;
						const dot	= px*dx + py*dy;

						if ( dot > maxDot ) {
							maxDot	= dot;
							bestI	= i;
						}
					}
					return bestI;
				}
			}
		})();

		//--------------------------------
		// Create blank matrix filled with null
		//--------------------------------
		/*const out =
			Array.from(
				{ length: rows },
				() => Array.from( { length: cols }, () => null )
				);*/
		//--------------------------------
		// Clone matrix to preserve interior
		//--------------------------------
		// Deep clone original matrix.
		const out = matrix.map( row => row.slice() );

		//--------------------------------
		// Loop perimeter and apply items cyclically
		//--------------------------------
		// Begin the loop at the est. specified start point.
		let i = startIndex;
		// Iterate around the matrix & populate alternating value(s).
		for ( let count=0; count<perimeter.length; count++ ) {
			const [y,x]	= perimeter[i];
			out[y][x]	= items[ count % items.length ];
			i = ( i + 1 ) % perimeter.length;
		}
		// Return altered final matrix.
		return out;
	}

	// Create a matrix using a supplied value.
	// RETURN: 2d [array] in specified dimensions filled with supplied data.
	// * w,h	- [int] Values for dimensions of new region.
	// * value	- [object] of specified data to fill in the region.
	createMatrix( w, h, value ) {
		return Array.from(
			{ length: h },
			() =>
				Array.from(
					{ length: w },
					() => ( { ...value } )
				));
	}

	//-------------------------
	// Check if Point is Inside Bounds
	//-------------------------
	// Determines if a given [x,y] coordinate lies inside a rectangular bounds.
	// RETURNS: [bool] true if the point is inside the bounds, false otherwise.
	// * px		– [int] x-coordinate of the point to test.
	// * py		– [int] y-coordinate of the point to test.
	// * rect	– [object] with keys: x, y, w, h (all in same unit space)
	isPointInBounds( px, py, rect ) {
		// Ensure rectangle is valid
		if ( !rect || typeof rect.x!=='number' || typeof rect.y!=='number'
			 || typeof rect.w!=='number' || typeof rect.h!=='number' )
			return false; // failed data
		// Perform in-bounds test
		return (
			px >= rect.x &&
			py >= rect.y &&
			px <  rect.x + rect.w &&
			py <  rect.y + rect.h
			);
	}
}
