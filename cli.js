
'use strict';

var args = require( 'minimist' )( process.argv.slice( 2 ) );
var logger = require( 'luvely' );
var app = require( './lib/gennifer' );

if ( !args.h ) {

  var dataInterval;
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

  app.registerTemplate( 'time', tmpl );

  io.sockets.on('connection', function (socket) {
    logger.debug( 'connection' );

    var reset = function() {
      dataInterval = setInterval(function(){
        app.volume( volume ).usingChannel( socket ).generate( 'time' );
      }, frequency);
    };

    socket.on('configure', function(data){
      clearInterval( dataInterval );
      frequency = data.frequency || frequency;
      volume = data.volume || volume;
      logger.info( 'Client requested reconfiguration: ', data );
      reset();
    });

    socket.on('disconnect', function(){
      clearInterval( dataInterval );
    });

    reset();

  });

} else {
  console.log('\n');
  console.log( '    Gennifer Options' );
  console.log('\n');
  console.log( '    -f --frequency  [optional] How often (in milliseconds) to send new data - defaults to 1000ms' );
  console.log( '    -v --volume     [optional] How many data items to send at each tick/interval - defaults to 1' );
  console.log( '    -p --port       [optional] The port - defaults to 8080' );
  console.log('\n');
}