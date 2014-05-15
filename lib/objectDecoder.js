
'use strict';

var util = require( 'util' );
var traverse = require( 'traverse' );
var overrides = {};
var types = [ 'Object', 'String', 'Function', 'Boolean', 'Array', 'Date' ];

function hasBeenOverriden( val ) {
  for ( var i = 0; i < types.length; i++ ) {
    if ( val === types[ i ] ) {
      return true;
    }
  }
}

function shouldBeOverriden( obj ) {
  for ( var i in obj ) {
    if ( overrides[ i ] ) {
      obj[ i ] = overrides[ i ];
    }
  }
  return obj;
}

exports.override = function( usrOverrides ) {
  overrides = usrOverrides;
  return exports;
};

/**
 * A function to try and determine the data types that make up
 * the given object. Not 100% right now.
 * @param  {object} obj The object with data
 * @return {object}     An object with datatypes
 */
exports.decodeObject = function( obj ) {
  var decoded = traverse( obj ).forEach(function(x){
    var typeStr = Object.prototype.toString.call( x );
    var parts = typeStr.split( ' ' );
    var len = parts[ 1 ].length;
    var type = parts[ 1 ].substring( 0, len - 1 );

    var foo = shouldBeOverriden( x );

    if ( !hasBeenOverriden( foo ) ) {
      if ( type !== 'Object' ) {
        this.update( type );
      }
    }
  });
  overrides = {};
  return decoded;
};

