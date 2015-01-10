
'use strict';

var frequencyMsg =  '[optional] How often (in milliseconds) ' +
                    'to send new data - defaults to 1000ms';
var volumeMsg    =  '[optional] How many data items to send at ' +
                    'each tick/interval - defaults to 1';
var portMsg      =  '[optional] The port - defaults to 8080';

exports.printHelp = function() {
  console.log('\n');
  console.log( '    Gennifer Options' );
  console.log('\n');
  console.log( '    -f (frequency)       %s', frequencyMsg );
  console.log( '    -v (volume)          %s', volumeMsg );
  console.log( '    -p (port)            %s', portMsg );
  console.log( '    -t (templates)       [optional] /path/to/templates.js' );
  console.log( '    -h (help)            [optional] Print available options' );
  console.log('\n');
};

exports.eachItem = function( obj, callback ) {

  // polyfill object.keys if it doesn't exist
  if ( typeof obj.keys !== 'function' ) {
    for ( var i in obj ) {
      if ( obj.hasOwnProperty( i ) ) {
        callback( obj[ i ], i );
      }
    }
  } else {
    var keys = obj.keys();
    keys.forEach(function( item, key ) {
      callback( item, key );
    });
  }
};
