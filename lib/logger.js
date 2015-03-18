
'use strict';

var luvely = require( 'luvely' );
var instance;

module.exports = function() {
  if ( !instance ) {
    instance = luvely;
  }
  return instance;
};
