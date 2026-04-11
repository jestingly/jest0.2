//-------------------------------------------------------
// JEST ® All Rights Reserved
// Antago (God of Gravity), author of Graal2001 & Destiny
// Copyright ® 1999-2026
//-------------------------------------------------------
console.log( 'jestAlert: js/apps/jest/components/util/JestParser.js loaded' );

//-------------------------
// JestParser Class
//-------------------------
// Field parsing and validation utility class.
// Extendable and modular check system for input field values.
class JestParser extends JestGamepiece {
	// Map of built-in or custom test methods by key.
	tests		= {};		// [object] key -> test function

	//--------------------------------
	// Constructor
	//--------------------------------
	// Construct the [object].
	// RETURNS: [void].
	// * client		- [object] parent controller
	constructor( client ) {
		super( client );			// call parent constructor
		this._registerDefaults();	// preload default test methods
	}

	//--------------------------------
	// Register Default Tests
	//--------------------------------
	// Adds internal default parsing/validation functions.
	// RETURNS: [void]
	_registerDefaults() {
		// General common regex types.
		this.registerTest( 'caps',			( val ) => /^[A-Z]+$/.test(val) );
		this.registerTest( 'lowercase',		( val ) => /^[a-z]+$/.test(val) );
		this.registerTest( 'alpha',			( val ) => /^[A-Za-z]+$/.test(val) );
		this.registerTest( 'numeric',		( val ) => /^[0-9]+$/.test(val) );
		this.registerTest( 'alphanumeric',	( val ) => /^[A-Za-z0-9]+$/.test(val) );
		this.registerTest( 'alphanumericS',	( val ) => /^[A-Za-z0-9\s]+$/.test(val) );
		this.registerTest( 'notEmpty',		( val ) => (val?.trim?.().length>0) );
		// Check if value is a positive integer.
		this.registerTest( 'unsignedInteger', ( val ) => /^[0-9]+$/.test(val) );
		// Allows optional leading sign, digits, optional decimal part.
		this.registerTest( 'isNumber',
			( val ) => {
				// Check if value is a number.
				if ( typeof val==='number' )
					return Number.isFinite( val );
				return /^-?\d+(\.\d+)?$/.test( val.trim?.() );
			});
		// Common account/profile regex types.
		this.registerTest( 'email',			( val ) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) );
		this.registerTest( 'username',		( val ) => /^[A-Za-z0-9_]{3,32}$/.test(val) );
		this.registerTest( 'hexcolor',		( val ) => /^#?[A-Fa-f0-9]{6}$/.test(val) );
		this.registerTest( 'url',			( val ) => /^https?:\/\/[^\s]+$/.test(val) );
		// Common range testing.
		this.registerTest( 'num0to10',		( val ) => this.hasNumericRange(val,5,10) );
		this.registerTest( 'min5',			( val ) => this.hasMinLength(val,5) );
		this.registerTest( 'len3to10',		( val ) => this.hasLengthRange(val,3,10) );
		this.registerTest( 'len3to20',		( val ) => this.hasLengthRange(val,3,20) );
	}

	//--------------------------------
	// Register a New Test Method
	//--------------------------------
	// Add a custom check function by name.
	// RETURNS: [bool] success.
	// * name	- [string] unique key.
	// * fn		- [function] test function with (value)=>bool
	registerTest( name, fn ) {
		// Validate argument(s).
		if ( typeof name!=='string' || typeof fn!=='function' )
			return false; // abort
		this.tests[name] = fn; // store [function]
		return true; // success
	}

	//--------------------------------
	// Remove Test Method
	//--------------------------------
	// Deletes a previously registered test.
	// RETURNS: [bool] success.
	removeTest( name ) {
		if ( !this.tests[name] )
			return false; // abort
		delete this.tests[name];
		return true;
	}

	//--------------------------------
	// Run Single Test By Name
	//--------------------------------
	// Call a registered test function.
	// RETURNS: [bool] result of test.
	// * name	- [string] test function key.
	// * value	- [any] value to check.
	runTest( name, value ) {
		// Get test fucntion.
		const fn = this.tests[name];
		// Require function to be a [function].
		if ( typeof fn!=='function' )
			return false; // abort
		return fn( value ); // [function] call
	}

	//--------------------------------
	// Run Multiple Tests
	//--------------------------------
	// Run multiple registered tests on a value.
	// RETURNS: [bool] true if all pass.
	// * names	- [array] of test keys.
	// * value	- [any] value to check.
	runTests( names, value ) {
		// Validate argument(s).
		if ( !Array.isArray(names) )
			return false; // abort
		// Iterate each regex key & test.
		for ( let name of names ) {
			if ( !this.runTest(name,value) )
				return false; // failed
		}
		return true; // success
	}

	//--------------------------------
	// Character Limit: Max
	//--------------------------------
	// RETURNS: [bool] true if value length <= max.
	// * value	- [string] to test.
	// * max	- [int] character limit.
	hasMaxLength( value, max ) {
		// Validate argument(s).
		if ( typeof value!=='string' )
			return false; // abort
		// Test maximum length.
		return value.length <= max;
	}

	//--------------------------------
	// Character Limit: Min
	//--------------------------------
	// RETURNS: [bool] true if value length >= min.
	hasMinLength( value, min ) {
		// Validate argument(s).
		if ( typeof value!=='string' )
			return false; // abort
		// Test minimum length.
		return value.length >= min;
	}

	//--------------------------------
	// Character Limit: Range
	//--------------------------------
	// RETURNS: [bool] true if within range.
	// * value - [string] to test.
	// * min   - [int] lower bound inclusive.
	// * max   - [int] upper bound inclusive.
	hasLengthRange( value, min, max ) {
		// Validate argument(s).
		if ( typeof value!=='string' ) return false;
		const len = value.length; // get [string] length
		// Validate length range.
		return (len>=min && len<=max);
	}

	//--------------------------------
	// Numeric Minimum Test
	//--------------------------------
	// RETURNS: [bool] true if numeric and >= min.
	// * value - [string|number]
	// * min   - [number]
	hasNumericMin( value, min ) {
		const num = Number(value);
		if ( Number.isNaN(num) || !Number.isFinite(num) ) return false;
		return (num >= min);
	}

	//--------------------------------
	// Numeric Maximum Test
	//--------------------------------
	// RETURNS: [bool] true if numeric and <= max.
	// * value - [string|number]
	// * max   - [number]
	hasNumericMax( value, max ) {
		const num = Number(value);
		if ( Number.isNaN(num) || !Number.isFinite(num) ) return false;
		return (num <= max);
	}

	//--------------------------------
	// Numeric Range Test
	//--------------------------------
	// Checks whether a value is numeric and within a range.
	// RETURNS: [bool] true if numeric and within range.
	// * value	- [string|number]
	// * min	- [number] lower bound inclusive
	// * max	- [number] upper bound inclusive
	hasNumericRange( value, min, max ) {
		// Convert value to number.
		const num = Number( value );

		// Reject NaN and non-finite values.
		if ( Number.isNaN(num) || !Number.isFinite(num) )
			return false; // abort

		// Validate numeric range.
		return (num>=min && num<=max);
	}

	//--------------------------------
	// Match RegExp
	//--------------------------------
	// RETURNS: [bool] true if regex matches.
	// * regex - [RegExp|string]
	// * value - [string]
	matchRegex( value, regex ) {
		// Validate argument(s).
		if ( typeof regex==='string' )
			regex = new RegExp( regex );
		// Validate the string using a regular expression.
		if ( !(regex instanceof RegExp) )
			return false;  // abort
		// Retrun [bool] test check of regular expression.
		return regex.test( value );
	}

	//--------------------------------
	// Get Failed Values from Array
	//--------------------------------
	// Scans multiple values and returns those that fail given test(s).
	// RETURNS: [array] of values that fail any test.
	// * tests	- [string|array] one or more registered test keys
	// * values	- [array] list of values to test
	getFailures( tests, values ) {
		// Normalize arguments.
		if ( typeof tests==='string' )
			tests = [tests]; // ensure tests is [array]
		if ( !Array.isArray(tests) || !Array.isArray(values) )
			return []; // invalid input, return nothing

		// Track failed values only.
		const fails = [];

		// Loop through values.
		for ( let i=0; i<values.length; i++ ) {
			const value = values[i];
			// If any test fails, track this value.
			for ( let t=0; t<tests.length; t++ ) {
				if ( !this.runTest(tests[t],value) ) {
					fails.push( value ); // fail found
					break; // no need to test further
				}
			}
		}
		return fails; // list of failed items
	}
}
