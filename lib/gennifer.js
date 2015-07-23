
'use strict';

var util        = require( 'util' );
var fs          = require( 'fs' );
var path        = require( 'path' );
var stream      = require( 'stream' );
var casual      = require( 'casual' );
var decoder     = require( './objectDecoder' );
var engine      = require( './engineUtils' ).useEngine( casual );
var log         = require( './logger' )();
var utils       = require( './utils' );

var Gennifer = function() {

  this.readable = true;
  this._templates = {};
  this._volume    = 1;
  this._config    = {};
  this._channel   = null;
};

util.inherits( Gennifer, stream );

/**
 * Registers the given template with the given name
 */
Gennifer.prototype.registerTemplate = function( templateName, tmpl ) {
  this._templates[ templateName ] = tmpl;
  engine.def( templateName, tmpl );
  return this;
};

/**
 * Generates an instance of the specified template
 */
Gennifer.prototype.generate = function( templateName ) {
  var tmp = [];

  for ( var i = 0; i < this._volume; i++ ) {
    var data =  engine.gen( templateName );
    tmp.push( data );
  }

  // emit a generic event for every new instance of a
  // template over our native stream
  this.emit( 'data',
    JSON.stringify( { template: templateName, data: tmp } )
  );

  // emit a specific event for this template over our native stream
  this.emit( templateName, tmp );

  // emit data over a foreign channel
  if ( this._channel ) {
    this._channel.emit( templateName, tmp );
  }

  return this;
};

Gennifer.prototype.volume = function( vol ) {
  if ( typeof vol === 'number' ) {
    this._volume = vol;
    return this;
  } else {
    return this._volume;
  }
};

Gennifer.prototype.loadConfig = function( pathToConfig ) {
  var file    = path.resolve( pathToConfig );
  var exists  = fs.existsSync( file );
  var templates;
  var tmp;

  if ( exists ) {

    if ( utils.endsWith( file, '.js' ) ) {
      // var blah = require( file )
      // console.log(blah)
      templates = require( file )( casual );
    } else {
      tmp = fs.readFileSync( file ).toString();
      try {
        this._config = JSON.parse( tmp );
        templates = engine.parseConfig( this._config.templates );
      } catch( e ) {
        log.error( e );
      }
    }

    for ( var i in templates ) {
      if ( templates.hasOwnProperty( i ) ) {
        this.registerTemplate( i, templates[ i ] );
      }
    }
  }
};

/**
 * A foreign channel over which to send templates
 */
Gennifer.prototype.channel = function( foreignChannel ) {
  if ( foreignChannel ) {
    this._channel = foreignChannel;
    return this;
  } else {
    return this._channel;
  }
};

Gennifer.prototype.resolveTypes = function( obj, overrides ) {
  overrides = overrides || {};
  return decoder.override( overrides ).decodeObject( obj );
};

Gennifer.prototype.end = function () {
  // this._transform.apply(this, arguments);
  return this.emit( 'end' );
};

Gennifer.prototype.templates = function() {
  return this._templates;
};

function isProbablyStream( obj ) {
    var streamFuncs = [ 'pipe', 'on', 'emit', 'once' ];

    for ( var i = 0; i < streamFuncs.length; i++ ) {
      var funcName = streamFuncs[ i ];
      if ( typeof obj[ funcName ] !== 'function' ) {
        return false;
      }
    }
    return true;
}

module.exports = function( configPath ) {
  return new Gennifer( configPath );
};
