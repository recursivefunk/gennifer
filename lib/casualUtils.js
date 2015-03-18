

'use strict';

var log     = require( './logger' )();
var keys    = {};
var casual;

function buildKey( name, prop ) {
  return name + ':' + prop;
}

exports.useInstance = function( casualInstance ) {
  casual = casualInstance;
  return exports;
};

exports.parseCasualType = function( str ) {

  if ( !casual ) {
    log.error( 'You must specify a casual instance!' );
    return;
  }

  var parts     = str.split( '%' );
  var prop      = parts[ 0 ];
  var needParam = false;

  if ( typeof casual[ prop ] === 'function' ) {
    needParam = true;
  } else if ( !casual[ prop ] ) {
    log.error( 'Unknown type', prop );
    return;
  }

  if ( !needParam ) {
    return {
      type: prop,
      params: []
    };
  }

  var params = parts[ 1 ].split( ',' );

  // return numbers
  params = params.map(function(item){
    var tmp = parseInt( item );
    if ( !isNaN( tmp ) ) {
      return tmp;
    }
    return item;
  });

  return {
    type: prop,
    params: params
  };

};

exports.parseConfig = function( templates ) {

  var parsed = {};

  for ( var name in templates ) {
    if ( templates.hasOwnProperty( name ) ) {
      var template = templates[ name ];
      parsed[ name ] = {};
      for ( var prop in template ) {
        if ( template.hasOwnProperty( prop ) ) {
          var parsedResult = exports
            .parseCasualType( template[ prop ] );
          var mappedType = exports.mapType( name, prop, parsedResult );
          parsed[ name ][ prop ] = mappedType;
        }
      }
    }
  }

  return parsed;
};

exports.mapType = function( name, prop, raw ) {
  var func;
  var key = buildKey( name, prop );

  if ( raw.params.length > 0 ) {
    func = casual[ raw.type ];
    keys[ key ] = raw.params;
    return casual[ raw.type ];
  } else {
    return raw.type;
  }
};

exports.generate = function( name ) {

  if ( !casual ) {
    log.error( 'You must specify a casual instance!' );
    return;
  }

  return casual[ name ];
};

exports.define = function( name, tmpl ) {
  var template;

  if ( typeof tmpl !== 'function' ) {
    var obj = {};
    for ( var i in tmpl ) {
      if ( typeof tmpl[ i ] === 'function' ) {
        var key = buildKey( name, i );
        var props = keys[ key ];
        obj[ i ] = tmpl[ i ].apply( null, props );
      } else {
        obj[ i ] = tmpl[ i ];
      }
    }
    template = function() {
      return obj;
    };
  } else {
    template = tmpl;
  }

  casual.define( name, template );

  return exports;
};

exports.gen = exports.generate;
exports.def = exports.define;
