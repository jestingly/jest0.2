//-------------------------------------------------------
// JEST ® All Rights Reserved
// Antago (God of Gravity), author of Graal2001 & Destiny
// Copyright ® 1999-2026
//-------------------------------------------------------
console.log( "jestAlert: js/embed/load.js booting environment..." );
// Wait for DOM load then inject main environment
window.addEventListener(
	'DOMContentLoaded',
	() => {
		const script	= document.createElement( 'script' );
		script.src		= 'js/embed/embed.js';
		document.body.appendChild( script );
	});
