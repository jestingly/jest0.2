//==================================================
// File: main.js
//==================================================

//-----------------------------
// Imports
//-----------------------------
// Electron “main” process
const { app, BrowserWindow, ipcMain, dialog, Menu } = require( 'electron' );
app.setName( 'JEST' ); // set app name
const path 		= require( 'path' );
const fs		= require( 'fs' );
// Redirect console.log and console.error to a file (visible in production)
const logPath	= path.join(app.getPath( 'userData'), 'main.log' );
const logStream	= fs.createWriteStream( logPath, { flags: 'a' } );

console.log		= (...args) => logStream.write( args.join(' ') + '\n' );
console.error	= (...args) => logStream.write( '[ERROR] ' + args.join(' ') + '\n' );
console.log( '✅ Main process started' );

//-----------------------------
// App Debug Mode
//-----------------------------
const isDev	= true; // set false in production

// Fix "Secure Restore" warning
app.applicationSupportsSecureRestorableState = () => true;
app.commandLine.appendSwitch( 'enable-gpu-rasterization' );
app.commandLine.appendSwitch( 'enable-zero-copy' );
app.commandLine.appendSwitch( 'disable-software-rasterizer' );

// Create an "About" popup.
app.setAboutPanelOptions({
	applicationName    : 'JEST',
	applicationVersion : app.getVersion(),
	copyright          : 'Copyright © 2018-2026 JEST®',
	authors            : ['Antago'],
	//website            : 'https://jesterly.net',
	credits            : 'JEST® is a proprietary level editor.',
	});

//-----------------------------
// setupAppMenu()
//-----------------------------
// Builds the application menu.
// Registers Edit menu and handlers for each action.
//-----------------------------
function setupAppMenu() {
	//--------------------------------
	// Edit Menu Template
	//--------------------------------
	const template = [
		{
			label: 'JEST',
			submenu: [
				{ role: 'about' },
				{ type: 'separator' },
				{ role: 'quit' }
			]
		},
		{
			label		: 'Edit',
				submenu		: [
					{ label: 'Undo',		role: 'undo',		click: onEditMenuClick },
					{ label: 'Redo',		role: 'redo',		click: onEditMenuClick },
					{ type : 'separator' },
					{ label: 'Cut',			role: 'cut',		click: onEditMenuClick },
					{ label: 'Copy',		role: 'copy',		click: onEditMenuClick },
					{ label: 'Paste',		role: 'paste',		click: onEditMenuClick },
					{ label: 'Select All',	role: 'selectAll',	click: onEditMenuClick }
				]
			}
		];
		/*{
			label    : 'View',
			submenu  :
				[
					{
						label       : 'Reload',
						role        : 'reload',
						accelerator : 'CmdOrCtrl+R'
					},
					{
						label       : 'Toggle Developer Tools',
						accelerator :
							process.platform === 'darwin'
								? 'Alt+Command+I'
								: 'Ctrl+Shift+I',
						click       : () => win.webContents.toggleDevTools()
					}
				]
		}*/

	//--------------------------------
	// Apply Menu
	//--------------------------------
	const menu = Menu.buildFromTemplate( template );
	Menu.setApplicationMenu( menu );
}

//-----------------------------
// onEditMenuClick()
//-----------------------------
// Handles Edit menu actions.
// Forwards role to renderer.
// * menuItem       - [MenuItem] clicked menu
// * browserWindow  - [BrowserWindow] source window
// * event          - [Event] native click event
//-----------------------------
function onEditMenuClick( menuItem, browserWindow, event ) {
	// Debug logging with location tag
	console.log( '[main.js:Line 45:Char 2] Edit menu "' + menuItem.label + '" clicked.' );

	// Send action to renderer via IPC
	if ( browserWindow && browserWindow.webContents )
		browserWindow.webContents.send( 'edit-menu-action', menuItem.role );
}

//-----------------------------
// createMainWindow()
//-----------------------------
// Instantiates main BrowserWindow.
// Loads local HTML file.
//-----------------------------
function createMainWindow() {
	const mainWindow =
		new BrowserWindow({
			width          : 960,
			height         : 540,
			webPreferences :
				{ preload  : path.join( __dirname, 'preload.js' ) }
			});

	mainWindow.loadURL( 'file://' + __dirname + '/index.html' );
}

//-----------------------------
// Create Main Window
//-----------------------------
function createWindow() {
	const win =
		new BrowserWindow({
			width          : 960,
			height         : 540,
			webPreferences :
				{
				preload          : path.join(__dirname, 'preload.js'),
				contextIsolation : true,
				nodeIntegration  : false
				}
			});
	win.loadFile( 'index.html' );

	// Devtools only if dev mode
	if ( isDev ) { // ← force on
		win.webContents.on(
			'did-finish-load',
			() => {
				if ( isDev ) {
					console.log('✅ Window loaded, opening DevTools...');
					win.webContents.openDevTools({ mode: 'detach' });
				}
			});

		win.webContents.on(
			'did-fail-load',
			( event, errorCode, errorDescription, validatedURL ) => {
				console.error( `❌ Failed to load: ${errorDescription} (${errorCode}) — ${validatedURL}` );
			});
	}
}

//-----------------------------
// App Ready
//-----------------------------
// Starts application after Electron is ready.
//-----------------------------
app.whenReady().then(
	() => {
		setupAppMenu();
		if ( isDev ) createWindow();
		else createMainWindow();

		app.on(
			'activate',
			() => {
				if ( BrowserWindow.getAllWindows().length===0 ) {
					if ( isDev ) createWindow();
					else createMainWindow();
				}
			});
	});

app.on(
	'window-all-closed',
	() => {
		if ( process.platform!=='darwin' )
			app.quit();
	});

//-----------------------------
// IPC: Save File
//-----------------------------
ipcMain.handle(
	'jest-save-file',
	async ( event, path, data ) => {
		// Check if user proceded to save file.
		try {
			const fs	= require( 'fs' );
			fs.writeFileSync( path, data );
			return { success: true, path };
		}
		catch ( err ) { // no file was saved
			console.error( `Failed to save file: ${err.message}` );
			return { success: false, error: err.message };
		}
	});

//-----------------------------
// IPC: Save File As
//-----------------------------
ipcMain.handle(
	'jest-save-file-as',
	async ( event, defaultName, data ) => {
		// Open a file save dialog.
		const result	=
			await dialog.showSaveDialog({
				defaultPath:	defaultName
				});
		// Check if user proceded to save file.
		if ( !result.canceled && result.filePath ) {
			const fs	= require( 'fs' );
			fs.writeFileSync( result.filePath, data );
			return { success: true, path: result.filePath };
		}
		// No file was saved.
		return { success: false, canceled: true };
	});

//-----------------------------
// IPC: Open File Dialog
//-----------------------------
ipcMain.handle(
	'jest-open-file-dialog',
	async ( event, options ) => {
		// Open a file select dialog.
		const result =
			await dialog.showOpenDialog({
				properties:
					[
						options.allowMultiple ? 'multiSelections' : 'openFile'
					],
				filters:
					[{
						name:		'Allowed Files',
						extensions:	options.extensions
					}]
				});
		// Iterate selected file(s) & return.
		if ( !result.canceled && result.filePaths?.length>0 ) {
			const fs		= require( 'fs' );
			const files		=
				result.filePaths.map(
					path => {
						const data	= fs.readFileSync( path );
						return { path, data };
					});
			return { success: true, files }; // selected file(s)
		}
		// No files were selected.
		return { success: false, canceled: true, files: [] };
	});
