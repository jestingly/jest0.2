console.log( 'jestAlert: js/apps/jest/components/ui/JestInputFileSelect.js loaded' );

//-----------------------------
// JestInputFileSelect Class
//-----------------------------
// Cross-platform file select panel
// Extends: JestElement
class JestInputFileSelect extends JestInput {
	// Object properties
	accept			= null;		// [string] Value of accepted file(s) hint
	allowMultiple	= false;	// [bool] whether to allow selecting multiple files

	//--------------------------------
	// Constructor
	//--------------------------------
	// Construct the [object].
	// RETURNS: [void].
	// * client		- client [object] this piece belongs to.
	// * accept		- [string] accepted filetypes (e.g. '.txt,.json').
	constructor( client, accept='' ) {
		super( client ); // call parent constructor
		this.accept		= accept ?? '';
	}

	//--------------------------------
	// Build Component
	//--------------------------------
	// Build the element [object].
	// RETURNS: [void].
	// * name		- unique [string] name of component.
	// * classes	- [array] of classes to add to panel element.
	build( name='file-select', classes=[] ) {
		// Construct parent panel
		if ( classes===null ) classes = [];
		super.build( name, ['file-select'].mergeUnique(classes) );
		// Add hidden input element (fallback)
		this.panel.addElements([
			{
				name:		'input',
				tag:		'input',
				attributes:
					{
						type:		'file',
						accept:		this.accept,
						style:		'display:none',
						multiple:	this.allowMultiple
					},
				callbacks:
					[{
						command:	'change',
						classes:	'input-file',
						type:		'dom',
						callback:	( e ) => { this.onInputFileSelect(e); }
					}]
			}
		]);
		// Store DOM input reference
		this.field	= this.panel.refs.input;
	}

	//--------------------------------
	// Open File Dialog (Cross-platform)
	//--------------------------------
	// Trigger file open dialog based on environment
	// RETURNS: [void]
	async openFileDialog() {
		//--------------------------------
		// Detect Environment
		//--------------------------------
		const isElectron	= !!( window && window.process && window.process.type );
		//--------------------------------
		// Electron (v.<12): Path-Based Open
		//--------------------------------
		// If Electron, handle file open differently.
		if ( isElectron ) {
			try {
				const { dialog }	= require( 'electron' ).remote;
				const fs			= require( 'fs' );
				const { filePaths }	=
					await dialog.showOpenDialog({
						properties: [ this.allowMultiple ? 'multiSelections' : 'openFile' ],
						filters:
							[{
								name:		'Allowed Files',
								extensions:	this.accept.replace(/\./g,'').split(',')
							}]
						});
				// Check if files have been selected.
				if ( filePaths && filePaths.length>0 ) {
					for ( const path of filePaths ) {
						const data	= fs.readFileSync( path );
						// Get file information.
						const fileInfo = this.client.getFileInfo( null, null, data, null, 'local' );
						// Emit path with file data and path (one per file)
						await this.emitAsync( 'select', {}, fileInfo );
					}
				}
			}
			catch ( err ) {
				console.error( `JestInputFileSelect Electron Open Error:`, err );
			}
		}
		//--------------------------------
		// Electron (v.>12): Using Context Bridge
		//--------------------------------
		if ( window.jestAPI && window.jestAPI.openFileDialog ) {
			console.error( 'Calling Electron openFileDialog' );
			const result =
				await window.jestAPI.openFileDialog({
					allowMultiple:	this.allowMultiple,
					extensions:		this.accept.replace(/\./g,'').split(',')
					});
			if ( result.files && result.files.length>0 ) {
				for ( const fileObj of result.files ) {
					// Get file information.
					const fileInfo = this.client.getFileInfo( fileObj.path, null, fileObj.data, null, 'local' );
					// Emit event.
					this.emit( 'select', null, fileInfo );
				}
			}
			return;
		}
		//--------------------------------
		// Chromium Browser: showOpenFilePicker
		//--------------------------------
		else if ( 'showOpenFilePicker' in window ) {
			try {
				const handles	=
					await window.showOpenFilePicker({
						multiple:	this.allowMultiple,
						types:
							[{
								description:	'Allowed Files',
								accept:			this._buildAcceptObject()
							}]
					});
				for ( const handle of handles ) {
					const file		= await handle.getFile();
					const fileData	= await file.arrayBuffer();
					// Get file information.
					const fileInfo = this.client.getFileInfo( null, file, fileData, handle, 'local' );
					// Emit event with file data and handle
					this.emit( 'select', null, fileInfo );
				}
			}
			catch ( err ) {
				console.error( `JestInputFileSelect Browser Open Error:`, err );
			}
		}
		//--------------------------------
		// Fallback: input type=file
		//--------------------------------
		else {
			this.field.el.click(); // Trigger hidden input element
		}
	}

	//--------------------------------
	// Input File Select Handler
	//--------------------------------
	// Handler for fallback <input type="file"> select event
	// * e		- event [object] from DOM input change
	onInputFileSelect( e ) {
		// Get file(s) & iterate to send select event(s).
		const files	= e.target.files;
		for ( const file of files ) {
			// Read file as ArrayBuffer
			const reader = new FileReader();
			/*reader.onload =
				( e ) => {
					// Emit event with file data (one per file selected).
					this.emit( 'select', null, { file: file, data: e.target.result } );
				};
				reader.readAsArrayBuffer( file );*/
			// Get file information.
			const fileInfo = this.client.getFileInfo( null, file, null, null, 'local' );
			// Emit path with file data and path (one per file)
			this.emit( 'select', null, fileInfo );
		}
	}

	//--------------------------------
	// Build Accept Object for showOpenFilePicker
	//--------------------------------
	// RETURNS: [object] accept object for showOpenFilePicker
	_buildAcceptObject() {
		// Assemble extensions & MIME types.
		const extensions	= this.accept.replace(/\./g,'').split(',');
		const mimeTypes		= extensions.map( (ext)=>this._mapExtensionToMimeType(ext) );
		// Begin accept [object].
		const acceptObj		= {};
		mimeTypes.forEach(
			( mime, index ) => {
				acceptObj[mime] = [ `.${extensions[index]}` ];
			});
		return acceptObj; // return compiled list of mime extensions
	}

	//--------------------------------
	// Map Extension to Basic MimeType
	//--------------------------------
	// RETURNS: [string] basic MIME type
	// * ext	- [string] file extension
	_mapExtensionToMimeType( ext ) {
		// Simple static map — expand as needed
		const map = {
			'txt':	'text/plain',
			'json':	'application/json',
			'csv':	'text/csv',
			'png':	'image/png',
			'jpg':	'image/jpeg',
			'jpeg':	'image/jpeg',
			'gif':	'image/gif'
			};
		return map[ext] || 'application/octet-stream';
	}
}
