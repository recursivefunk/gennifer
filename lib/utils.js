
'use strict';

var util = require( 'util' );
var traverse = require( 'traverse' );

exports.decodeObject = function( obj ) {
  var decoded = traverse( obj ).forEach(function(x){
    var typeStr = Object.prototype.toString.call( x );
    var parts = typeStr.split( ' ' );
    var len = parts[ 1 ].length;
    var type = parts[ 1 ].substring( 0, len - 1 );
    if ( type !== 'Object' ) {

      // make sure it's not a date string
      if ( type === 'String' ) {
        var date = Date.parse( x );
        if ( isNaN( date ) ) {
          this.update( 'String' );
        } else {
          this.update( 'Date' );
        }
      } else {
        this.update( type );
      }
    }
  });

  return decoded;
};