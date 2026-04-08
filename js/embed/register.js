console.log( 'jestAlert: js/embed/register.js loaded' );
// Declare global environment [object]
var jsos						= null;
var JestEnvironment				= null;
var JestEnvironmentStatus		= 'shutdown';
var JestLibraryRegistry			= {};				// [object] for registering custom libraries
var JestAppsRegistry			= {};				// [object] for registering custom apps
var JestMixins					= {};				// [object] for registering mixins

// Set status function
const setStatus =
	() => {
		JestEnvironmentStatus	= 'running';
	};

//const BASE_PATH = "http://jesterly.net/"; // or "/apps/jest/" if deployed under a subfolder
function jestGetURL( path ) {
	/*if ( typeof chrome!=='undefined' && chrome.runtime?.getURL ) {
		return jestGetURL( path );
	}*/
	return /*BASE_PATH +*/ path;
}
