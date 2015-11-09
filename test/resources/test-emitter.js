
'use strict';

var util = require( 'util' );
var EventEmitter = require('events').EventEmitter;

var Emitter = function() {
  var self = this;
};

util.inherits( Emitter, EventEmitter );

module.exports = new Emitter();