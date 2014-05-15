
'use strict';

var util = require( 'util' );
var traverse = require( 'traverse' );

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
    if ( type !== 'Object' ) {
      this.update( type );
    }
  });
  return decoded;
};