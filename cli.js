#!/usr/bin/env node

'use strict';

var args = require( 'minimist' )( process.argv.slice( 2 ) );
var fs = require( 'fs' );
var logger = require( 'luvely' );
var ChannelManager = require( './lib/channelManager' );
var utils = require( './lib/utils' );
var clients = {};

if ( !args.h ) {

  var frequency = args.f || 1000;
  var volume = args.v || 1;
  var port = args.p || 8080;
  var io = require( 'socket.io' ).listen( port );
  var templates;

  if ( !args.t ) {
    var tmpl = function() {
      return {
        when: Date.now()
      };
    };

    templates = { time: tmpl };
  } else {
    templates = require( args.t );
  }

  logger.debug( 'Starting gennifer in server mode. Frequency: 1 tick/%sms, Volume: %s item(s)/tick', frequency, volume );

  io.sockets.on('connection', function (socket) {
    logger.debug( 'connection' );
    var opts = {
      frequency: frequency,
      volume: volume
    };

    var newManager =
      new ChannelManager( socket, opts )
          .registerTemplates( templates )
          .useTemplate( 'time' )
          .monitor();

    clients[ newManager.id() ] = newManager;

    newManager.onDisconnect(function(){
      delete clients[ newManager.id() ];
    });

  });

  logger.info( 'Ready :)' );

} else {
  utils.printHelp();
}