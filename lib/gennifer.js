
'use strict';

var fs = require( 'fs' );
var path = require( 'path' );
var casual = require( 'casual' );
var walk = require( 'walk' );
var decoder = require( './objectDecoder' );
// needs to be an event emitter or at least implement .emit( 'event', someData )
var channel;
var ignoreChannel = false;
var templates = {};
var volume = 1;
var walkerOpts = {
  followLinks: false,
  filters: ['Temp', '_Temp']
};

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

exports.loadTemplates = function( str ) {
  var filePath;
  var templates;

  if ( isJSFile( str ) ) { // is it a js file?
    filePath = path.resolve( str );
    templates = require( filePath );
    for ( var i in templates ) {
      exports.registerTemplate( i, templates[ i ] );
    }
  }
  return exports;
};

exports.templates = function() {
  return templates;
};

exports.generate = function( templateName ) {
  var tmp = [];

  for ( var i = 0; i < volume; i++ ) {
    var data =  casual[ templateName ];
    tmp.push( data );
  }

  if ( channel ) {
    channel.emit( templateName, tmp );
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

function isJsonFile( str ) {
  return /\.json$/.test( str );
}

function isJSFile( str ) {
  return /\.js$/.test( str );
}
