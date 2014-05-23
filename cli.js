
'use strict';

var args = require( 'minimist' )( process.argv.slice( 2 ) );
var logger = require( 'luvely' );
var ChannelManager = require( './lib/channelManager' );
var utils = require( './lib/utils' );

if ( !args.h ) {

  var frequency = args.f || 1000;
  var volume = args.v || 1;
  var port = args.p || 8080;
  var io = require( 'socket.io' ).listen( port );

  var tmpl = function() {
    return {
      when: Date.now()
    };
  };

  logger.debug( 'Starting gennifer in server mode. Frequency: 1 tick/%sms, Volume: %s item(s)/tick', frequency, volume );

  io.sockets.on('connection', function (socket) {
    logger.debug( 'connection' );
    var opts = {
      frequency: frequency,
      volume: volume
    };

    new ChannelManager( socket, opts )
        .setTemplate( 'time', tmpl )
        .autoRun();
  });

} else {
  utils.printHelp();
}