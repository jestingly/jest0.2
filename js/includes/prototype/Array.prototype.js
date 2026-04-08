console.log( 'jestAlert: js/mediacore/animation/AnimatorTickerEvent.js loaded' );

//-------------------------
// Extend Array Prototype
//-------------------------
// Remove value from [array] if it exists.
// RETURNS: new modified [array].
// * value		- [...] value to remove if inside [array].
Array.prototype.remove = function( value ) {
	return this.filter( cls => cls!==value );
}

// Obtain first value of an [array].
// RETURNS: [...] first value of [array].
Array.prototype.first = function() {
	return this[0]; // first element
}

//-----------------------------
// Array.prototype.mergeUnique
//-----------------------------
// Description: Merges this array with another and removes duplicates.
// * otherArray - [array] Array to merge
// RETURNS: [array] New array with unique strings
Array.prototype.mergeUnique = function ( otherArray ) {
	if ( !Array.isArray(otherArray) )
		throw new TypeError('Argument must be an array');

	return Array.from(new Set([...this, ...otherArray]));
};
