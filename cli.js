#!/usr/bin/env node

'use strict';

var path            = require( 'path' );
var args            = require( 'minimist' )( process.argv.slice( 2 ) );
var utils           = require( './lib/utils' );
var log             = require( 'luvely' );
var ChannelManager  = require( './lib/channelManager' );
var utils           = require( './lib/utils' );
var clients         = {};

if ( !args.h ) {

  var frequency = args.f || 1000;
  var volume    = args.v || 1;
  var port      = args.p || 3000;
  var io        = require( 'socket.io' ).listen( port );
  var templates;
  var defaultTemplate;

  if ( !args.t ) {
    var tmpl = function() {
      return {
        when: Date.now()
      };
    };

    templates = { time: tmpl };
    defaultTemplate = 'time';
  } else {
    templates = require( path.resolve( args.t ) );
    // the default template will be default be the
    // first one
    for ( var i in templates ) {
      if ( templates.hasOwnProperty( i ) ) {
        defaultTemplate = i;
        break;
      }
    }
    log.debug( 'Found default tempalte \'%s\' ', defaultTemplate );
  }

  var debugMsg = 'Starting gennifer in server mode. Frequency: '+
                 '1 tick/%sms, Volume: %s item(s)/tick';
  log.debug( debugMsg, frequency, volume );

  io.sockets.on('connection', function (socket) {
    log.debug( 'Socket %s connected', socket.id );
    var opts = {
      frequency: frequency,
      volume: volume,
      socketId: socket.id
    };

    var newManager =
      new ChannelManager( socket, opts )
          .registerTemplates( templates )
          .useTemplate( defaultTemplate )
          .monitor();

    clients[ newManager.id() ] = newManager;

    newManager.onDisconnect(function(){
      delete clients[ newManager.id() ];
    });

  });

  log.info( 'Ready :)' );

} else {
  utils.printHelp();
}
