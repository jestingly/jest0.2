console.log( "jestAlert: js/embed/load.js booting environment..." );
// Wait for DOM load then inject main environment
window.addEventListener(
	'DOMContentLoaded',
	() => {
		const script	= document.createElement( 'script' );
		script.src		= 'js/embed/embed.js';
		document.body.appendChild( script );
	});
