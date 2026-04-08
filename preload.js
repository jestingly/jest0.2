// preload.js
// Runs in “isolated world” and bridges main ⇄ renderer
const { contextBridge, ipcRenderer } = require( 'electron' );
contextBridge.exposeInMainWorld(
	'jestAPI',
	{
		// @returns {Promise<{success: boolean, filePath?: string, content?: string, error?: string}>}
		//loadFile: async () =>
		//	return await ipcRenderer.invoke( 'jest-load-file' ),
		// Open File
		// @param {string} defaultFilename	– the suggested filename (e.g. “notes.txt”)
		// @param {string} data				– the text to write
		// @returns {Promise<{success: boolean, filePath?: string, error?: string}>}

		saveFile:
			async ( path, data ) => {
				return await ipcRenderer.invoke( 'jest-save-file', path, data );
			},
		saveFileAs:
			async ( defaultName, data ) => {
				return await ipcRenderer.invoke( 'jest-save-file-as', defaultName, data );
			},
		openFileDialog:
			async ( options ) => {
				return await ipcRenderer.invoke( 'jest-open-file-dialog', options );
			}
	});
