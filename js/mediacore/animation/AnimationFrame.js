console.log( 'jestAlert: js/mediacore/animation/AnimationFrame.js loaded' );

//-------------------------
// AnimationFrame Class
//-------------------------
class AnimationFrame {
	// Object propert(ies).
	_index			= -1;		// [int] Value of frame's position in animation.
	animation		= null;		// [object] Animation the layer belonds to.
	// Identification properties.
	name			= null;		// [string] Value of animation view name.
	// Timing propert(ies)
	duration		= null;		// [int] Value of duration of the frame in ms
	// Visual propert(ies)
	layers			= [];		// [array] of layer(s) (layers contain the sprite(s))

	//-------------------------
	// Instantiation
	//-------------------------
	// Declare properties.
	// Construct the [object].
	// * animation	- [object] Animation instance to add.
	// * name		- [string] Name of the layer.
	//   duration	- [int] value of duration of the frame in ms (defaults to 60)
	//   index		- [int] value of frame's index in the animation.
	constructor( animation, name, duration=null, index=0 ) {
		this.animation	= animation;	// store animation reference
		this.name		= name;			// Assign the view name
		this.duration	= duration ?? 1000/60*4; // Duration of the frame in ms
		this.setIndex( index );			// default frame index
		this._createLayer();			// auto-create a blank layer
	}

	//-------------------------
	// Index Management
	//-------------------------
	// Sets the frame's timeline index.
	// Called internally during reindexing.
	// * index		- [int] value of frame's index in the animation.
	setIndex( index ) {
		this._index	= index;	// set frame index
	}

	// Returns the frame's timeline index.
	// RETURNS: [int] index
	getIndex() {
		return this._index;
	}

	//-------------------------
	// Layer Management
	//-------------------------
	// Returns the frame's # of layer(s).
	// RETURNS: [int] count
	getLayerCount() {
		return this.layers.length;
	}

	// Adds a layer to the frame
	// RETURNS: [AnimationLayer] instance.
	_createLayer() {
		return this._createLayerAt( null ); // [AnimationLayer]
	}

	// Creates and inserts a layer at a specific index.
	// RETURNS: [AnimationLayer] instance.
	// * index – [int] Where to insert the new layer
	_createLayerAt( index=null ) {
		// Validate argument(s).
		if ( index===null || index<0 || index>this.getLayerCount() )
			index	= this.getLayerCount();
		// Generate name from index.
		const name	= `layer_${index}`;
		// Construct the new layer.
		const layer	= new AnimationLayer( this.animation, name, this );
		// Insert layer at the target index.
		this._insertLayerAt( layer, index ); // Insert it
		// Return the layer.
		return layer; // [AnimationLayer] instance
	}

	// Inserts a new or existing layer at a specific index.
	// If already exists, moves it.
	// RETURNS: [void].
	// * layer – [AnimationLayer] to insert
	// * index – [int] Insertion index
	_insertLayerAt( layer, index ) {
		//--------------------------------
		// Forbid Double Insertion
		//--------------------------------
		// Remove layer first if already inside frame.
		const currentIndex = this.layers.indexOf( layer );
		if ( currentIndex !== -1 )
			this._removeLayerAt( currentIndex );

		//--------------------------------
		// Insert Layer @ Requested Index
		//--------------------------------
		// Clamp to valid range
		index = Math.max( 0, Math.min(index,this.getLayerCount()) );
		this.layers.splice( index, 0, layer );
		this._resortLayerIndices(); // enforce index = array position
	}

	//-------------------------
	// Remove Layer
	//-------------------------
	// Removes a layer at a specified index from this frame.
	// RETURNS: [boolean] True if removed, false if index invalid.
	// * index - [int] Index of the layer to remove
	_removeLayerAt( index ) {
		//--------------------------------
		// Validate Index
		//--------------------------------
		// Check if index is within bounds.
		if ( index<0 || index>=this.getLayerCount() )
			return false; // invalid index

		//--------------------------------
		// Remove Layer
		//--------------------------------
		// Access [AnimationLayer] instance.
		const layer	= this.layers[index];
		/*🛑 layer.removeAllStickers(); // wipe stickers*/
		// Splice layer out of frame layers [array].
		this.layers.splice( index, 1 );

		//--------------------------------
		// Ensure At Least One Layer Exists
		//--------------------------------
		// If no layers remain, create an empty layer.
		if ( this.layers.length===0 ) {
			const layer	= this._createLayer(); // auto-create a blank layer
			console.warn( `[AnimationFrame] No layers remaining. Auto-created fallback layer.` );
		}

		//--------------------------------
		// Reindex & Return
		//--------------------------------
		this._resortLayerIndices(); // Refresh all indexes
		return true; // success
	}

	// Removes all layer(s) from all frame(s).
	// RETURNS: [boolean] true if removed
	_clearLayers() {
		// Iterate frame & remove every layer.
		const count	= this.getLayerCount();
		for ( let i=(count-1); i>=0; i-- )
			this._removeLayerAt( i );
		return true; // success
	}

	//-------------------------
	// Utility Methods
	//-------------------------
	// Retrieves a layer by index
	// RETURNS: [object|null] AnimationLayer at the given index or null if out of bounds.
	// * index		- [int] Index of the layer to retrieve
	getLayerAt( index=null ) {
		return this.layers[index] ?? null; // Return null if invalid
	}

	//-------------------------
	// Layer Ordering Utilities
	//-------------------------
	// Sorts layers with external comparator, then reindexes.
	// RETURNS: [void].
	// * compareFn – [function] (a,b) comparator
	sortLayers( compareFn ) {
		this.layers.sort( compareFn );
		this._resortLayerIndices(); // sync ._index
	}

	// Reindexes all layers so that .index = position in array.
	// RETURNS: [void].
	_resortLayerIndices() {
		// Reindex all chronologically.
		for ( let i=0; i<this.getLayerCount(); i++ )
			this.layers[i].setIndex( i );
	}
}
