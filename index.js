
'use strict';

var casual = require( 'casual' );
var decoder = require( './lib/objectDecoder' );
// needs to be an event emitter or at least implement .emit( 'event', someData )
var channel;
var ignoreChannel = false;
var templates = {};

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

exports.generate = function( templateName ) {
  var data = casual[ templateName ];
  if ( channel ) {
    channel.emit( templateName, data );
  }
  return data;
};

exports.ignoreChannel = function() {
  ignoreChannel = true;
  return exports;
};

exports.usingChannel = function( _channel ) {
  channel = _channel;
  return exports;
};