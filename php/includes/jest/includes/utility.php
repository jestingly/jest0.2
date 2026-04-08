<?php

	// Clean print some value within '<pre>' tags
	// * $value		- [...] value to clean print
	//   $echo		- [boolean] value whether to autoprint the output `true` or return [string] `false`; defaults to `true`
	//   $index		- [integer] value of backtrace (for chain parsing); defaults to 0
	function prent( $value=null, $echo=true, $index=1 ) {
		// Allow for unlimited arguments
		$args	= func_get_args();
		// Handle backtrace
		$trace	= debug_backtrace_array();
		if ( !is_int($index) || $index<0 )	$index = 1;
		if ( $index>(count($trace)-1) )		$index = count($trace) - 1;
		// Build output surrounded in <pre> tags
		$out  = '<pre>';
			$out .= $trace[$index];
			$out .= print_r( $value, true );
		$out .= '</pre>';
		// Print or return output [string]
		if ( $echo===true ) echo $out;
		return $out;
	}

	// Takes unlimited arguments & outputs them into a readable tree
	//   ...$args	- [...] values to clean print
	function bough( ...$args ) {
		// Build output surrounded in <pre> tags
		foreach ( $args as $arg )
			prent( $arg, true, 2 );
	}

	// Styled print_r
	function print_pre( $value, $return=false, $css=array() ) {
		// Apply default style(s)
		$defaults =
			array(
				'-webkit-border-radius'	=> '3px',
				'-moz-border-radius'	=> '3px',
				'border-radius'			=> '3px',
				'background-color'		=> '#F0F0F0',
				'padding'				=> '3px',
				'border'				=> '1px solid #A8A8A8'
				);
		if ( is_array($css) )
			foreach ( $defaults as $key=>$value )
				$css[$key] = $value;
		// Process style(s)
		$styles = array();
		foreach ( $styles as $key=>$value )
			array_push( $styles, $key.': '.$value.';' );
		// Build output
		$out = '<pre style="'.implode(' ',$applyStyles).'">'.print_r($value,true).'</pre>';
		// Print or return
		if ( $return ) return $out;
		print( $out );
	}

	// Backtrace the call stack for debugging & print [string]
	//   $limit		- [integer] # of backtrace limit; defaults to 12
	function debug_backtrace_array( $limit=12 ) {
		// Declare variable(s)
		$stack	= '';
		$i		= 0;
		$out	= array();
		$trace	= debug_backtrace();
		// Build output [array]
		foreach ( $trace as $track ) {
			if ( $i===0 ) { // skip first index & reference the node (for alignment)
				$prev = $track;
				$i ++;
				continue;
			}
			elseif ( $i>$limit ) break; // limit reached
			// Store [string] stack to output
			$stack  = '';
			$stack .= "#$i ";
			$function = array_key_exists('function',$prev) ? $track['function'] : '<unknown-function>';
			$stack .= $function.'():';
			$file	= array_key_exists('file',$prev) ? $prev['file'] : '<unknown-file>';
			$line	= array_key_exists('line',$prev) ? $prev['line'] : '<unknown-line>';
			$stack .= $file.'(' .$line.')'.PHP_EOL;
			array_push( $out, $stack );
			$i ++;
			// Reference previous node
			$prev	= $track;
		}
		// Return output [array]
		return $out;
	}

	// error_log() a value in a formatted way
	//   $value	- [...] value to error_log()
	function plog( $value ) {
		if ( !is_string($value) )
			$value = print_r( $value, true );
		error_log( $value );
	}

	// error_log() then echo a value & die
	//   $value	- [...] value to error_log() & echo
	function decholog( $value ) {
		if ( !is_string($value) )
			$value = print_r( $value, true );
		error_log( $value );
		echo $value;
		die;
	}

	// Short form of error_log
	function elog( $value ) { error_log( $value ); }

	//-----------------------------
// Debug Logging Utilities
//-----------------------------

	//--------------------------------
	// plog() — Pretty Log Output
	//--------------------------------
	// Logs a value to error_log() with file and line number context.
	// * $value	- [mixed] value to log
	function dbtlog( $value ) {
		// Use backtrace to locate origin
		$trace = debug_backtrace( DEBUG_BACKTRACE_IGNORE_ARGS, 1 );
		$file  = isset($trace[0]['file']) ? $trace[0]['file'] : 'unknown file';
		$line  = isset($trace[0]['line']) ? $trace[0]['line'] : '??';

		// Convert complex values to readable format
		if ( !is_string($value) )
			$value = print_r( $value, true );

		// Format and log the message
		$msg = "[{$file} @ line {$line}]\n{$value}";
		error_log( $msg );
	}

	//--------------------------------
	// decholog() — Dump + Die with Log
	//--------------------------------
	// Logs value, echoes it, and dies — with file and line context.
	// * $value	- [mixed] value to log and display
	function dbt_decholog( $value ) {
		$trace = debug_backtrace( DEBUG_BACKTRACE_IGNORE_ARGS, 1 );
		$file  = isset($trace[0]['file']) ? $trace[0]['file'] : 'unknown file';
		$line  = isset($trace[0]['line']) ? $trace[0]['line'] : '??';

		if ( !is_string($value) )
			$value = print_r( $value, true );

		$msg = "[{$file} @ line {$line}]\n{$value}";
		error_log( $msg );
		echo $msg;
		die;
	}

	//--------------------------------
	// elog() — Simple Log with Context
	//--------------------------------
	// Logs string to error_log() with file/line context.
	// * $value - [string] value to log
	function dbt_elog( $value ) {
		$trace = debug_backtrace( DEBUG_BACKTRACE_IGNORE_ARGS, 1 );
		$file  = isset($trace[0]['file']) ? $trace[0]['file'] : 'unknown file';
		$line  = isset($trace[0]['line']) ? $trace[0]['line'] : '??';

		error_log( "[{$file} @ line {$line}] {$value}" );
	}



	// Create a well-formated title from a string
	function title_case( $str ) {
		if ( strstr($str,'.') )
			$str = substr( $str, 0, strrpos($str,'.') );
		return smart_case( trim(str_replace('_',' ',$str)), true );
	}

	// Smart Titlecase Capitalization
	function smart_case( $str, $review_for_previous_capitalization=false ) {
		//	If told to review,
		//	Only Auto Format if they have not specified some capitalization already
		if ( !$review_for_previous_capitalization || (strtolower($str)===$str || strtoupper($str)===$str) ) {
			$str = strtolower( $str );
			return ucwords( $str );
			//preg_replace( "/(?<=(?<!:|'s)\W)(A|An|As|And|At|For|In|Of|On|Or|The|To|With|Nor|But|Is|If|Then|Else|When|From|By|Off|For|Out|Over|Into|Onto)(?=\W)/e", 'strtolower("$1")', ucwords($str) );
		}
		else return $str;
	}

	// Split string at capital letters & connect with hyphens
	// RETURNS: [string] (with hyphens if caps found), or false if $str not [string]
	function capdash( $str ) {
		if ( !is_string($str) ) return false;
		return strtolower( implode( '-', preg_split('/(?=[A-Z])/',lcfirst($str)) ) );
	}
	// Smash string at hyphens & capslock after each dash
	// RETURNS: [string] without hyphens (chars capitalized after hyphen breaks if found)
	function smashcap( $str ) {
		if ( !is_string($str) ) return false;
		return lcfirst( implode('',array_map('ucfirst',explode('-',$str))) );
	}

	// Check for a server variable; defaults to $_REQUEST
	function request_var( $var, $required=false, $type='REQUEST' ) {
		$type		= '_'.strtoupper( $type );
		$isArray	= is_array( $var );
		if ( !strstr($var,'[') && !$isArray ) // String is not an array
			$value = ( isset($GLOBALS[$type][$var]) ) ? $GLOBALS[$type][$var] : null;
		else { // String is an array
			$keys	= !$isArray ? explode( '[',str_replace(']','',$var) ) : $var;
			$value	= $GLOBALS[$type]; // PHP does a lazy copy, so there is no performance issue here
			while ( sizeof($keys)>0 ) {
				$key	= array_shift( $keys );
				$value	= $value[$key];
			}
		}
		if ( $value!='' ) return $value;
		elseif ( !$required ) return '';
		else return null;
	}

	// Pull an object from an array of items by variable(s) tested against a property
	//   $items		- [array] of [objects]
	//   $values	- single or [array] of variables to test in order of precedence
	//   $variable	- [string] name of object property to test for
	//   $null		- [boolean] whether to return the first item in $items, or null if nothing found
	function filter_default( $items, $values, $variable, $null=false ) {
		if ( is_array( $values ) ) {
			$found = false;
			foreach ( $values as $value ) {
				if ( isset($value) && $value!='' ) {
					$found = true;
					break;
				}
			}
			if ( !$found )
				return !$null ? $items[0] : null;
		}
		else $value = $values;
		foreach ( $items as $item ) {
			switch ( true ) {
				case is_object($item):
					if ( $item->$variable==$value ) return $item;
				case is_array($item):
					if ( $item[$variable]==$value ) return $item;
			}
		}
		return !$null ? $items[0] : null;
	}

	// Loop through test variables & find first one set
	function find_set() {
		// Get args of the function
		$args	= func_get_args();
		$c		= count( $args );
		if ( $c<1 ) return null;
		elseif ( $c===1 )		$args = $args[0];
		if ( !is_array($args) )	$args = array( $args );
		// Loop through and return first set instance
		foreach ( $args as $arg )
			if ( (isset($arg) && $arg!='') || $arg===0 || $arg==='0' )
				return $arg;
		// None of the vars were set
		return null;
	}

	// Build a URL address wit GET variables
	function build_url( $add=array(), $remove=array(), $url=null ) {
		// Default url to current page
		if ( is_null($url) ) $url = WAX_URL.$_GET['url'];
		// Handle GET params
		$params	= array();
		if ( $remove!='*' ) {
			$params = $_GET;
			if ( is_array($remove) )
				foreach ( $remove as $var=>$val )
					unset( $params[$var] );
		}
		if ( is_array($add) )
			foreach ( $add as $var=>$val )
				$params[$var] = $val;
		// Build the HTTP Query
		$query	= http_build_query( $params );
		// Remove any GET params from URL
		$url	= explode( '?', $url );
		return $url[0].(!empty($query)?'?'.$query:'');
	}

	// Take a URL & loads the page, or simply refreshes
	function redirect( $url=null ) {
		if ( empty($url) )
			$url = $_SERVER['REQUEST_URI'];
		header( 'Location: '.$url ); die;
	}

	// Clone an object with filtered properties
	function clonesome( $object=null, $props=null ) {
		// $props - must be an array
		if ( !is_array($props) ) $props = array();
		$clone = (object) array();
		foreach ( $object as $key=>$prop )
			if ( in_array($key,$props) )
				$clone->{$key} = $prop;
		return $clone;
	}

	// Takes an array and sorts it by properties
	function multisort( $arr, $prop ) {
		// Get args of the function
		$args	= func_get_args();
		$c		= count( $args );
		if ( $c<2 ) return false;
		// Get the array to sort
		$array	= array_splice( $args, 0, 1 );
		$array	= $array[0];
		// Sort with an annoymous function using args
		usort( $array,
			function($a, $b) use($args) {
				$i		= 0;
				$c		= count( $args );
				$cmp	= 0;
				while ( $cmp==0 && $i<$c ) {
					if ( !is_numeric($a[$args[$i]]) || !is_numeric($b[$args[$i]]) )
						$cmp	= strcmp( $a[$args[$i]], $b[$args[$i]] );
					else $cmp	= $a[$args[$i]] - $b[$args[$i]];
					$i++;
				}
				return $cmp;
			});
		// Return sorted array
		return $array;
	}

	// Checks & returns the type of the user agent
	function check_user_agent( $type=null ) {
		$user_agent = strtolower( $_SERVER['HTTP_USER_AGENT'] );
		if ( $type=='bot' ) {
			// matches popular bots
			if ( preg_match("/googlebot|adsbot|yahooseeker|yahoobot|msnbot|watchmouse|pingdom\.com|feedfetcher-google/",$user_agent) )
				return true;
				// watchmouse|pingdom\.com are "uptime services"
		}
		elseif ( $type=='browser' ) {
			// matches core browser types
			if ( preg_match("/mozilla\/|opera\//",$user_agent) )
				return true;
		}
		elseif ( $type=='mobile' ) {
			// matches popular mobile devices that have small screens and/or touch inputs
			// mobile devices have regional trends; some of these will have varying popularity in Europe, Asia, and America
			// detailed demographics are unknown, and South America, the Pacific Islands, and Africa trends might not be represented, here
			if ( preg_match("/phone|iphone|itouch|ipod|symbian|android|htc_|htc-|palmos|blackberry|opera mini|iemobile|windows ce|nokia|fennec|hiptop|kindle|mot |mot-|webos\/|samsung|sonyericsson|^sie-|nintendo/",$user_agent) )
				// these are the most common
				return true;
			elseif ( preg_match("/mobile|pda;|avantgo|eudoraweb|minimo|netfront|brew|teleca|lg;|lge |wap;| wap /",$user_agent) )
				// these are less common, and might not be worth checking
				return true;
		}
		return false;
	}

	// Returns a sanitized [string] value for general security
	// RETURNS: [string] value or [null] if empty
	// * $string	- [string] value to sanitize
	function alphanumeric( string $string ) {
		$sanitized	= preg_replace( "/[^A-Za-z0-9 ]/", '', $string );
		return $sanitized!=='' ? $sanitized : null;
	}

	// Returns a pointer to a nested dimension by default
	//	$action	- alternative programmable queued duty; 'delete' removes dimension(s)
	function &dimension( $coordinates=null, &$pointer=null, $action=null, $depth=0 ) {
		if ( is_null($coordinates) || $pointer===null )
			return false;
		if ( !is_array($coordinates) )
			$coordinates = array( $coordinates );
		// Current type being checked
		$current = $coordinates[0];
		// Ensure the coordinates space exists
		if ( !isset($pointer[$current]) || empty($pointer[$current]) ) {
			if ( sizeof($coordinates)>1 ) $pointer[$current] = array();
			else $pointer[$current] = array();
		}
		// Not on the last coorindate
		if ( sizeof($coordinates)>1 ) {
			array_shift( $coordinates );
			$dimension	= &dimension( $coordinates, $pointer[$current], $action, $depth+1 );
			return $dimension;
		}
		else $dimension = &$pointer[$current];
		// Perform the specified action on destination coordinate
		switch ( $action ) {
			// Delete a dimension
			case 'delete':
				$dimension = null;
				unset( $pointer[$current] );
				return true;
			// Return the path to the dimension
			default: return $dimension;
		}
	}

	// Take multidimensional [array] & abduct a compiled [array] of items matching criteria
	//   $criteria	- items must match array key to value
	//		ie. $criteria=array($key=>$value) ->
	//			$array[0][5][$key] = $value / abduct
	function abduct( $array=null, $criteria=null, &$items=null, $depth=0 ) {
		// Crieria is required
		if ( empty($array) || empty($criteria) || !is_array($criteria) ) return false;
		if ( !is_array($items) ) $items = array();
		if ( $depth==0 ) $array = array( $array ); // The root array can also be abducted
		// Recursively search for all items matching critera
		foreach ( $array as &$part ) {
			// Check if we are looking at a response
			foreach ( $criteria as $key=>$value ) {
				if ( !$part[$key]===$value ) {
					abduct( $part, $criteria, $items, $depth+1 ); // Recursively dig through each part
					continue 2;
				}
				$items[] = $part;
			}
		}
		return $items;
	}

	// Check a value and implode it by delimiter
	function shrink( $value=null, $delimiter=',' ) {
		if ( !is_null($value) )
			return is_array($value) ? implode($delimiter,$value) : $value;
		return null;
	}

	// Append options to a query
	function query_append( &$query=null, $value=null, $column='id', $type='find' ) {
		switch ( $type ) {
			case 'find':
				$value = shrink( $value );
				if ( !is_null($value) )
					$query .= " AND FIND_IN_SET(".$column.",'".$value."')>0";
				break;
			default: return false;
		}
		return true;
	}

	// Convert a date timestamp to short relative text
	function relative_time( $datetime ) {
		// Convert to timestamp
		$timestamp = !ctype_digit($datetime) ? strtotime($datetime) : $datetime;
		$diff = time()-$timestamp;
		if ( $diff==0 ) return 'now';
		elseif ( $diff>0 ) {
			$day_diff = floor( $diff/86400 );
			if ( $day_diff==0 ) {
				if ( $diff<60 )		return 'just now';
				if ( $diff<120 )	return '1 minute ago';
				if ( $diff<3600 )	return floor($diff/60).' minutes ago';
				if ( $diff<7200 )	return '1 hour ago';
				if ( $diff<86400 )	return floor($diff/3600).' hours ago';
			}
			if ( $day_diff==1 )		return 'Yesterday';
			if ( $day_diff<7 )		return $day_diff.' days ago';
			if ( $day_diff<31 )		return ceil($day_diff/7).' weeks ago';
			if ( $day_diff<60 )		return 'last month';
			return date( 'F Y', $timestamp );
		}
		else {
			$diff = abs( $diff );
			$day_diff = floor( $diff/86400 );
			if ( $day_diff==0 ) {
				if ( $diff<120 )	return 'in a minute';
				if ( $diff<3600 )	return 'in '.floor($diff/60).' minutes';
				if ( $diff<7200 )	return 'in an hour';
				if ( $diff<86400 )	return 'in '.floor($diff/3600).' hours';
			}
			if ( $day_diff==1 )		return 'Tomorrow';
			if ( $day_diff<4)		return date('l', $timestamp);
			if ( $day_diff<7+(7-date('w')) )	return 'next week';
			if ( ceil($day_diff/7)<4 )			return 'in ' . ceil($day_diff / 7) . ' weeks';
			if ( date('n',$timestamp)==date('n')+1 ) return 'next month';
			return date( 'F Y', $timestamp );
		}
	}

	// Takes a value and tests if it is valid JSON
	function is_json( $string=null ) {
		// Require parameter to at least be [string]
		if ( !is_string($string) ) return false;
		// Attempt JSON decode
		$decode = json_decode( $string );
		return json_last_error()==JSON_ERROR_NONE ? $decode : false;
	}

	// Trim a [string] from the right end of a [string]
	// RETURNS: trimmed [string]
	//   $str		- original [string]
	//   $needle	- [string] to trim from the end
	//   $case		- [boolean] whether case sensitive or not
	function str_rsnip( $str, $needle, $case=true ) {
		$func = $case ? "strpos" : "stripos";
		if ( $func($str,$needle,strlen($str)-strlen($needle))!==false )
			$str = substr( $str, 0, -strlen($needle) );
		return $str;
	}
	// Trim a [string] from the left end of a [string]
	// RETURNS: trimmed [string]
	//   $str		- original [string]
	//   $needle	- [string] to trim from the end
	//   $case		- [boolean] whether case sensitive or not
	function str_lsnip( $str, $needle, $case=true ) {
		$func = $case ? "strpos" : "stripos";
		if ( $func($str,$needle)===0 )
			$str = substr( $str, strlen($needle) );
		return $str;
	}

?>
