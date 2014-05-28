
'use strict';

var casual = require( 'casual' );
var decoder = require( './objectDecoder' );
// needs to be an event emitter or at least implement .emit( 'event', someData )
var channel;
var ignoreChannel = false;
var templates = {};
var volume = 1;

exports.overrideProps = function( props ) {
  decoder.override( props );
};

exports.resolveTypes = function( obj, overrides ) {
  overrides = overrides || {};
  return decoder.override( overrides ).decodeObject( obj );
};

exports.registerTemplate = function( templateName, tmpl ) {
  templates[ templateName ] = tmpl;
  casual.define( templateName, tmpl );
  return exports;
};

exports.volume = function( _vol ) {
  if ( _vol ) {
    volume = _vol;
    return exports;
  } else {
    return volume;
  }
};

exports.generate = function( templateName ) {
  var tmp = [];

  for ( var i = 0; i < volume; i++ ) {
    var data =  casual[ templateName ];
    tmp.push( data );
  }

  if ( channel ) {
    if ( channel.volatile ) {
      channel.volatile.emit( templateName, tmp );
    } else {
      channel.emit( templateName, tmp );
    }
  }

  return tmp;
};

exports.ignoreChannel = function() {
  ignoreChannel = true;
  return exports;
};

exports.channel = function( _channel ) {
  if ( _channel ) {
    channel = _channel;
    return exports;
  } else {
    return channel;
  }
};